const mongoose = require("mongoose");

// Project Schema
const ProjectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Project title is required"],
    trim: true,
    maxlength: 100,
  },
  description: {
    type: String,
    required: [true, "Project description is required"],
    maxlength: 500,
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  clientName: {
    type: String,
    required: true,
  },
  clientEmail: {
    type: String,
    required: true,
  },
  service: {
    type: String,
    required: true,
    enum: [
      "Residential Construction",
      "Commercial Construction", 
      "Home Remodeling",
      "Interior Design",
      "Structural Repairs",
      "Industrial Project",
      "Infrastructure & Heavy Construction",
      "Renovation Project"
    ],
  },
  status: {
    type: String,
    enum: ["pending", "in-progress", "completed", "cancelled"],
    default: "pending",
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high", "urgent"],
    default: "medium",
  },
  budget: {
    type: Number,
    min: 0,
  },
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
  deadlineFrom: {
    type: Date,
  },
  deadlineTo: {
    type: Date,
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  assignedTeam: [{
    name: String,
    role: String,
    contact: String,
  }],
  documents: [{
    name: String,
    url: String,
    uploadDate: {
      type: Date,
      default: Date.now,
    },
  }],
  notes: [{
    content: String,
    author: String,
    date: {
      type: Date,
      default: Date.now,
    },
  }],
}, { timestamps: true });

module.exports = mongoose.model("Project", ProjectSchema);