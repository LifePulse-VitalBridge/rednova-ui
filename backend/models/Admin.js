import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // We will store this HASHED, not plain text
  role: { type: String, default: 'COMMANDER' }, // Just for the cool factor
  createdAt: { type: Date, default: Date.now }
});
export const Admin = mongoose.model('Admin', adminSchema);

// dotenv.config();

// const createAdmin = async () => {
//   try {
//     await mongoose.connect(process.env.MONGO_URI);
//     console.log("✅ DB Connected for Seeding");

//     // --- YOUR ADMIN CREDENTIALS HERE ---
//     const email = "admin@rednovavital.tech"; 
//     const plainPassword = "admin@123"; // Change this!

//     // Check if exists
//     const existingAdmin = await Admin.findOne({ email });
//     if (existingAdmin) {
//       console.log("⚠️ Admin already exists!");
//       process.exit();
//     }

//     // Hash the password (Security)
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(plainPassword, salt);

//     // Create Admin
//     const newAdmin = new Admin({
//       email,
//       password: hashedPassword,
//       role: 'SUPREME_COMMANDER'
//     });

//     await newAdmin.save();
//     console.log("🎉 Admin Account Created Successfully!");
//     console.log(`📧 Email: ${email}`);
//     console.log(`🔑 Password: (The one you typed in code)`);

//     process.exit();
//   } catch (error) {
//     console.error("❌ Error:", error);
//     process.exit(1);
//   }
// };

// createAdmin();