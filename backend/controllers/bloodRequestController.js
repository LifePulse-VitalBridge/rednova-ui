import {BloodRequest} from '../models/BloodRequest.js';
 

// 1. CREATE REQUEST (Triggered by the User's "Transmit Signal" button)
export const createRequest = async (req, res) => {
  try {
    const { 
      email, patientName, age, bloodGroup, units, 
      urgency, hospitalName, locationCoordinates, contactNumber, note 
    } = req.body;

    const newRequest = new BloodRequest({
      requesterEmail: email,
      patientName,
      age,
      bloodGroup,
      units,
      urgency,
      hospitalName,
      contactNumber,
      note,
      location: {
        type: 'Point',
        // MongoDB stores GeoJSON as [Longitude, Latitude]
        coordinates: [locationCoordinates.lng, locationCoordinates.lat] 
      }
    });

    const savedRequest = await newRequest.save();
    res.status(201).json(savedRequest);

  } catch (error) {
    console.error("Create Request Error:", error);
    res.status(500).json({ message: "Distress Signal Failed", error: error.message });
  }
};

// 2. GET STATUS (Triggered by the Frontend Polling)
export const getRequestStatus = async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request Not Found" });
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

