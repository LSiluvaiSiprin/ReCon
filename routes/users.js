const express = require("express");
const User = require("../models/user");
const router = express.Router();

// GET all users (admin only)
router.get("/all", async (req, res) => {
  try {
    const users = await User.find({ role: "user" })
      .select("-password")
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
});

// GET user profile
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
});

// UPDATE user profile
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Remove password from update data if present
    delete updateData.password;
    
    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.json({ msg: "Profile updated successfully", user });
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
});

// TOGGLE user status (admin only)
router.put("/:id/toggle-status", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({ 
      msg: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      user: { id: user._id, email: user.email, isActive: user.isActive }
    });
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
});

module.exports = router;