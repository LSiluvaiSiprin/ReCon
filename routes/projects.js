const express = require("express");
const Project = require("../models/project");
const User = require("../models/user");
const router = express.Router();

// GET all projects (admin only)
router.get("/all", async (req, res) => {
  try {
    const projects = await Project.find()
      .populate("client", "username email")
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
});

// GET user's projects
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const projects = await Project.find({ client: userId })
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
});

// CREATE new project
router.post("/create", async (req, res) => {
  try {
    const {
      title,
      description,
      clientId,
      clientName,
      clientEmail,
      service,
      budget,
      deadlineFrom,
      deadlineTo,
    } = req.body;

    const project = await Project.create({
      title,
      description,
      client: clientId,
      clientName,
      clientEmail,
      service,
      budget,
      deadlineFrom,
      deadlineTo,
    });

    res.status(201).json({ 
      msg: "Project created successfully", 
      project 
    });
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
});

// UPDATE project status (admin only)
router.put("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, progress, notes } = req.body;

    const updateData = { status };
    if (progress !== undefined) updateData.progress = progress;
    if (notes) {
      updateData.$push = {
        notes: {
          content: notes,
          author: "Admin",
        }
      };
    }

    const project = await Project.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!project) {
      return res.status(404).json({ msg: "Project not found" });
    }

    res.json({ msg: "Project updated successfully", project });
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
});

// DELETE project (admin only)
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findByIdAndDelete(id);

    if (!project) {
      return res.status(404).json({ msg: "Project not found" });
    }

    res.json({ msg: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
});

// GET project statistics
router.get("/stats", async (req, res) => {
  try {
    const totalProjects = await Project.countDocuments();
    const pendingProjects = await Project.countDocuments({ status: "pending" });
    const inProgressProjects = await Project.countDocuments({ status: "in-progress" });
    const completedProjects = await Project.countDocuments({ status: "completed" });
    const totalUsers = await User.countDocuments({ role: "user" });

    res.json({
      totalProjects,
      pendingProjects,
      inProgressProjects,
      completedProjects,
      totalUsers,
    });
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
});

module.exports = router;