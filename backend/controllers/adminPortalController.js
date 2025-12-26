import { BloodBank } from '../models/mapBank.js'; // Updated Import
import { BloodRequest } from '../models/BloodRequest.js';
import User from '../models/Donor.js'; 
import { makeCall } from '../services/call.js';

// --- SECTOR A: BLOOD BANKS ---
export const getBanks = async (req, res) => {
  try {
    // FIXED: Used 'BloodBank' instead of 'MapBank'
    const banks = await BloodBank.find({});
    res.json(banks);
  } catch (error) {
    res.status(500).json({ message: "Sector A Down", error: error.message });
  }
};

export const addBank = async (req, res) => {
  try {
    // FIXED: Used 'new BloodBank' instead of 'new MapBank'
    const newBank = new BloodBank(req.body);
    await newBank.save();
    res.status(201).json(newBank);
  } catch (error) {
    res.status(400).json({ message: "Failed to deploy Node", error: error.message });
  }
};

export const updateBank = async (req, res) => {
  try {
    // FIXED: Used 'BloodBank' instead of 'MapBank'
    const updatedBank = await BloodBank.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedBank);
  } catch (error) {
    res.status(400).json({ message: "Update Failed", error: error.message });
  }
};

// --- SECTOR B: REQUESTS ---
export const getPendingRequests = async (req, res) => {
  try {
    const requests = await BloodRequest.find({ isVerified: false });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: "Sector B Down", error: error.message });
  }
};

export const verifyRequest = async (req, res) => {
  try {
    // Set isVerified to true AND status to APPROVED
    const updatedRequest = await BloodRequest.findByIdAndUpdate(
      req.params.id, 
      { isVerified: true, status: 'APPROVED' }, 
      { new: true }
    );
    console.log("Initiating Call for Verified Request:");
    await makeCall();
    res.json(updatedRequest);
  } catch (error) {
    res.status(400).json({ message: "Verification Failed", error: error.message });
  }
};

// --- SECTOR C: RECRUITMENT ---
export const getApplicants = async (req, res) => {
  try {
    const applicants = await User.find({ isAppliedForMission: true });
    res.json(applicants);
  } catch (error) {
    res.status(500).json({ message: "Sector C Down", error: error.message });
  }
};

export const updateDonorStats = async (req, res) => {
  try {
    // Admin can edit Rank, XP, DonationCount
    const { rank, xp, donationCount, certificateApproved } = req.body;
    const updatedDonor = await User.findByIdAndUpdate(
      req.params.id, 
      { rank, xp, donationCount, certificateApproved, isAppliedForMission: false }, 
      { new: true }
    );
    res.json(updatedDonor);
  } catch (error) {
    res.status(400).json({ message: "Update Failed", error: error.message });
  }
};