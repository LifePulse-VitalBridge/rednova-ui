import User from '../models/User.js';
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
          from: 'RedNova <onboarding@resend.dev>',
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