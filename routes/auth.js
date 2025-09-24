const express = require("express");
const User = require("../models/user");
const router = express.Router();

// SIGNUP
router.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ msg: "Email already registered" });

    const user = await User.create({ username, email, password });
    res.status(201).json({ msg: "User registered successfully", user: { id: user._id, email: user.email } });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ msg: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "User not found" });

    // Check if user is active
    if (!user.isActive) {
      return res.status(400).json({ msg: "Account is deactivated. Please contact admin." });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid password" });

    res.status(200).json({ 
      msg: "Login successful", 
      user: { 
        id: user._id, 
        email: user.email,
        username: user.username,
        role: user.role,
        profile: user.profile
      } 
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

module.exports = router;
