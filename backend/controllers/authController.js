// Welcome email logic is added in the syncUser so remove it .

import User from '../models/User.js';
import {BloodBank} from '../models/mapBank.js';
import { Resend } from 'resend';
import { welcomeEmailTemplate } from '../services/emailTemplates.js'
import dotenv from 'dotenv';
import cloudinary from '../config/cloudinary.js';
import Tesseract from 'tesseract.js';
import streamifier from 'streamifier';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export const syncUser = async (req, res) => {
  
  try {
    const { uid, name, email } = req.body;
    if (!uid) {
      return res.status(400).json({ message: "UID required" });
    }
    if (!email) {
      return res.status(400).json({message: "Email required"});
    }

    // THE LOGIC: Find One and Update (with upsert: true)
    // 1. Search by firebaseUid
    // 2. Set the name (updates it if changed)
    // 3. upsert: true -> If not found, CREATE it.
    // 4. new: true -> Return the newest version of the doc
    const user = await User.findOneAndUpdate(
      { firebaseUid: uid },
      {
        firebaseUid: uid,
        name: name || "No Name",
        email: email,
      },
      { upsert: true, new: true }
    );
    // Email Welcome Message
    if (!user.isWelcomeEmailSent) {
      try {
        console.log("Sending Welcome Email to:", user.email);
        await resend.emails.send({
          from: 'RedNova <contact@rednovavital.tech>',
          to: user.email,
          subject: 'Welcome to RedNova Family!',
          html: welcomeEmailTemplate(user.name),
        });
        // Mark Welcom Email as Sent
        user.isWelcomeEmailSent = true;
        console.log("Email sent successfully!");
      } catch (emailError) {
        console.error("Error sending welcome email:", emailError.message);
      }
    } else {
      console.log("Welcome email was already sent.");
    }

    res.status(200).json({ message: "User Synced", user });
  } catch (error) {
    console.error("Sync Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const updatePhone = async (req, res) => {
  
  const { userId, phone } = req.body;
     
  try {
    let user = await User.findOne({firebaseUid: userId});
    if (!user) {
      return res.status(404).json({ message: "User not found"});
    }

    // Update Phone
    user.phoneNumber = phone;
    user.isPhoneVerified = true;

    // Email Welcome Message
    if (!user.isWelcomeEmailSent) {
      try {
        console.log("Sending Welcome Email to:", user.email);
        await resend.emails.send({
          from: 'RedNova <contact@rednovavital.tech>',
          to: user.email,
          subject: 'Welcome to RedNova Family!',
          html: welcomeEmailTemplate(user.name),
        });
        // Mark Welcom Email as Sent
        user.isWelcomeEmailSent = true;
        console.log("Email sent successfully!");
      } catch (emailError) {
        console.error("Error sending welcome email:", emailError.message);
      }
    } else {
      console.log("Welcome email was already sent.");
    }
    await user.save();
    res.status(200).json({ message: "Phone Updated", user});
  } catch (error) {
    console.error("Update Phone Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
}

export const getUserProfile = async (req, res) => {

  try {
    const email = req.params.email;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message  });
  }
}

export const updateUserProfile = async (req, res) => {
  try {
    const { email, name, phone, bloodGroup, location, dob } = req.body;
    const user = await User.findOne({ email });
    if(!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.name = name || user.name;
    user.phoneNumber = phone || user.phoneNumber;
    user.bloodGroup = bloodGroup || user.bloodGroup;
    user.location = location || user.location;
    if (dob) {
      user.dob = new Date(dob);
    }
    const updateUser = await user.save();
    res.status(200).json({ 
      message: "Profile Updated Successfully", user: updateUser });
  } catch (error) {
    res.status(500).json({ message: "Update Failed", error: error.message });
  }
}

export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    
    // OCR Processing, We extract text from the image
    const { data: {text} } = await Tesseract.recognize(
      req.file.buffer,
      'eng',
      { logger: m => console.log(m) }
    );
    // Normalize text to lowercase for checking
    const scannedText = text.toLowerCase();
    // Forbidden words list
    const forbiddenWords = [ "fuck", "shit", "bitch", "asshole", "damn" ];
    // Check for forbidden words
    const foundAbuse = forbiddenWords.some(word => scannedText.includes(word));

    if (foundAbuse) {
      return res.status(400).json({ message: "Bete samajhdar bano, samaj pe kalank nahin!"});
    }

    // Upload to Cloudinary
    // We use streamifier to convert buffer to stream because Cloudinary SDK supports stream upload and buffer is in RAM
    const uploadFromBuffer = (buffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'rednova_avatars' },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );
        streamifier.createReadStream(buffer).pipe(stream);
      });
    };
    const result = await uploadFromBuffer(req.file.buffer);

    // Update MongoDB User Document
    // Assuming req.body.email is sent along with the file
    const {email} = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.profilePicture = result.secure_url;
    await user.save();
    res.status(200).json({ message: "Image Uploaded Successfully", imageUrl: result.secure_url });
  } catch (error) {
    console.error("Upload Avatar Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};



export const getNearbyBanks = async (req, res) => {
  try {
    const { lat, lng, search } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ message: "Coordinates (lat, lng) required" });
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    
    // Default Filter: Must have SOME stock to be listed
    let matchQuery = { totalStock: { $gt: 0 } }; 

    // --- SEARCH LOGIC ENGINE ---
    if (search && search.trim() !== "") {
      const cleanSearch = search.trim();
      
      // LOG THE EXACT SEARCH TERM RECEIVED (For Debugging)
      console.log(`🔍 Processing Search: "${cleanSearch}"`); 

      // REGEX EXPLANATION:
      // ^                -> Start of string
      // (A\+|...|AB-)    -> Capture Blood Type (Group 1)
      // \s* -> Allow ZERO or MORE spaces (Fixes "A+12" vs "A+ 12")
      // (\d+)            -> Capture Number (Group 2)
      // $                -> End of string
      const bloodWithUnit = /^(A\+|A-|B\+|B-|O\+|O-|AB\+|AB-)\s*(\d+)$/i.exec(cleanSearch);
      
      const bloodOnly = /^(A\+|A-|B\+|B-|O\+|O-|AB\+|AB-)$/i.exec(cleanSearch);

      if (bloodWithUnit) {
        // CASE: "A+ 12"
        const type = bloodWithUnit[1].toUpperCase();
        const units = parseInt(bloodWithUnit[2]);
        console.log(`🎯 DETECTED UNIT SEARCH: Type=${type}, Units=${units}`); // Debug Log
        
        matchQuery = { [`stock.${type}`]: { $gte: units } };
      } 
      else if (bloodOnly) {
        // CASE: "A+"
        const type = bloodOnly[1].toUpperCase();
        console.log(`🩸 DETECTED TYPE SEARCH: Type=${type}`); // Debug Log
        
        matchQuery = { [`stock.${type}`]: { $gt: 0 } };
      } 
      else {
        // CASE: Name/Location
        matchQuery = {
          $or: [
            { name: { $regex: cleanSearch, $options: 'i' } },
            { location: { $regex: cleanSearch, $options: 'i' } }
          ]
        };
      }
    }

    // --- AGGREGATION PIPELINE ---
    const banks = await BloodBank.aggregate([
      // 1. Calculate Distance (Always Step 1)
      {
        $geoNear: {
          near: { type: "Point", coordinates: [userLng, userLat] },
          distanceField: "dist.calculated",
          maxDistance: 500000, // 500km
          spherical: true
        }
      },
      // 2. Sum Total Stock (Helper for filtering)
      {
        $addFields: {
          totalStock: {
            $add: [
              "$stock.A+", "$stock.A-", "$stock.B+", "$stock.B-",
              "$stock.O+", "$stock.O-", "$stock.AB+", "$stock.AB-"
            ]
          }
        }
      },
      // 3. Apply the Logic We Built Above
      { $match: matchQuery },
      
      // 4. Sort by Distance (Nearest First)
      // Note: $geoNear does this by default, but this ensures it stays sorted after filtering
      { $sort: { "dist.calculated": 1 } }
    ]);

    // --- FORMATTING (Apply Road Factor) ---
    const refinedBanks = banks.map(bank => ({
      ...bank,
      dist: { 
        calculated: bank.dist.calculated * 1.4 // 1.4x Road Curvature Estimation
      }
    }));

    res.status(200).json(refinedBanks);

  } catch (error) {
    console.error("Search Logic Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};