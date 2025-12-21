import Donor from '../models/Donor.js';

// 1. JOIN AS DONOR (ENLISTMENT)
export const joinDonor = async (req, res) => {
  try {
    const { 
      uid, email, name, 
      bloodGroup, weight, 
      coordinates, address,
      medicalConditions // <--- NEW INPUT
    } = req.body;

    let donor = await Donor.findOne({ $or: [{ email }, { firebaseUid: uid }] });
    
    if (donor) {
      // --- UPDATE EXISTING DONOR ---
      donor.weight = weight;
      donor.bloodGroup = bloodGroup;
      donor.medicalConditions = medicalConditions;
      donor.address = address;
      donor.location = { type: 'Point', coordinates: [coordinates.lng, coordinates.lat] };
      donor.isAppliedForMission = true; // Mark as active donor 
      await donor.save();

      return res.status(200).json({ 
        message: "Profile Updated", 
        donor: donor,
        exists: true 
      });
    }

    // B. Create New Donor Profile
    const newDonor = new Donor({
      firebaseUid: uid,
      email,
      name,
      bloodGroup,
      weight,
      address,
      medicalConditions, // <--- SAVE TO DB
      isAppliedForMission: true, // Mark as active donor
      location: {
        type: 'Point',
        coordinates: [coordinates.lng, coordinates.lat] 
      },

      // Initialize Gamification
      rank: 'RECRUIT',
      donationCount: 0,
      xp: 100,
      badges: [{ id: 'Badge_Enlistment', dateEarned: new Date() }]
    });

    const savedDonor = await newDonor.save();
    
    console.log(`✅ New Agent Enlisted: ${name} (${bloodGroup})`);
    res.status(201).json({ message: "Welcome to RedNova", donor: savedDonor });

  } catch (error) {
    console.error("Enlistment Error:", error);
    res.status(500).json({ message: "Database Error", error: error.message });
  }
};


// 2. CHECK STATUS (For checking if user is already a donor on login)
export const checkDonorStatus = async (req, res) => {
  try {
    const { email } = req.params;
    const donor = await Donor.findOne({ email });
    
    if (donor) {
      return res.json({ isDonor: true, donor });
    } else {
      return res.json({ isDonor: false });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

