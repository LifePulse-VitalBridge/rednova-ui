import mongoose from "mongoose";
import dotenv from "dotenv";
// 1. The Data (Paste the full JSON array of 60+ hospitals here)
import bloodBanksData from "./bloodbanks.js";

dotenv.config();



// 2. The Schema
const bloodBankSchema = new mongoose.Schema({
  name: { type: String, required: true },
  region: { type: String, required: true },
  address: { type: String, required: true },
  contact: { type: String, required: true },
  location: {
    type: { type: String, default: "Point" },
    coordinates: { type: [Number], required: true } // [Longitude, Latitude]
  },
  stock: {
    A_POS: { type: Number, default: 0 },
    B_POS: { type: Number, default: 0 },
    O_POS: { type: Number, default: 0 },
    AB_POS: { type: Number, default: 0 },
    A_NEG: { type: Number, default: 0 },
    B_NEG: { type: Number, default: 0 },
    O_NEG: { type: Number, default: 0 },
    AB_NEG: { type: Number, default: 0 }
  },
  lastUpdated: { type: Date, default: Date.now }
});

// Force collection name to 'bloodBanks'
const BloodBank = mongoose.model("BloodBank", bloodBankSchema, "bloodBanks");

const seedDB = async () => {
  try {
    // A. Connect
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // B. Clear & Seed
    await BloodBank.deleteMany({});
    console.log("🧹 Old data cleared");

    await BloodBank.insertMany(bloodBanksData);
    console.log("🌱 Blood Bank data inserted");

    // C. Create Index
    await BloodBank.collection.createIndex({ location: "2dsphere" });
    console.log("🗺️  Geospatial Index created");

    // ---------------------------------------------------------
    // D. THE TEST: Find Nearest to LPU (Phagwara)
    // ---------------------------------------------------------
    console.log("\n🔍 TESTING: Finding nearest blood bank to LPU...");
    
    // LPU Coordinates: [75.7033, 31.2536]
    const nearest = await BloodBank.findOne({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [75.7033, 31.2536] 
          }
        }
      }
    });

    if (nearest) {
      console.log(`✅ TEST PASSED! The nearest blood bank is:`);
      console.log(`   🏥 Name: ${nearest.name}`);
      console.log(`   📍 City: ${nearest.region}`);
      console.log(`   📞 Contact: ${nearest.contact}`);
    } else {
      console.log("❌ TEST FAILED: No hospital found.");
    }
    // ---------------------------------------------------------

    console.log("\n🎉 SUCCESS: Database ready for REDNOVA!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
};

seedDB();