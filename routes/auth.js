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
    const a = req;
    
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    console.log(user,"jency")
    if (!user) return res.status(400).json({ msg: "User not found" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid password" });

    res.status(200).json({ msg: "Login successful", user: { id: user._id, email: user.email ,user1:user} });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

module.exports = router;
