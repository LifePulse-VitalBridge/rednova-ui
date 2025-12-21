import {Admin} from '../models/Admin.js';
import bcrypt from 'bcryptjs';
// No JWT import needed anymore

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find Admin
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ message: "Access Denied: Invalid Identity" });

    // 2. Check Password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ message: "Access Denied: Invalid Credentials" });

    // 3. Generate a "Simple Access Badge" (Instead of JWT)
    // We create a unique string using the Admin's ID and the current time.
    const token = `REDNOVA-COMMAND-ACCESS-${admin._id}-${Date.now()}`;

    // 4. Send Success Response
    res.status(200).json({ 
        message: "Welcome back, Commander.", 
        token, // The frontend will store this just like a JWT
        admin: { email: admin.email, role: admin.role } 
    });

  } catch (error) {
    console.error("Login Error:", error); // This prints the exact error to your VS Code terminal
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};