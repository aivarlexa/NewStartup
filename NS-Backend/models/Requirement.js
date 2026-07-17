const mongoose = require("mongoose");

const requirementSchema = new mongoose.Schema(
  {
    client: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    projectTitle: { type: String, required: true, trim: true },
    category: { type: String, default: "" },
    description: { type: String, required: true },
    skillsRequired: { type: [String], default: [] },
    technologyStack: { type: [String], default: [] },
    budget: { type: String, default: "" },
    deadline: { type: String, default: "" },
    priority: { type: String, enum: ["Low", "Medium", "High", "Urgent"], default: "Medium" },
    projectType: { type: String, default: "" },
    experienceRequired: { type: String, default: "" },
    attachments: { type: [String], default: [] },
    additionalNotes: { type: String, default: "" },
    
    // --- ADDED FOR TEAM ASSIGNMENTS TO FIX THE 500 population CRASH ---
    team: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", default: [] }],
    lead: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    
    // Updated enum options to strictly allow "Planning", "Development", "Testing" for your Kanban lanes
    status: { 
      type: String, 
      enum: ["Draft", "Pending", "Open", "Planning", "Development", "Testing", "Completed", "Cancelled", "Rejected"], 
      default: "Pending" 
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Requirement", requirementSchema);