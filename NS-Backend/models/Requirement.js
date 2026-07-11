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
    status: { type: String, enum: ["Draft", "Pending", "Open", "Assigned", "Completed", "Cancelled"], default: "Pending" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Requirement", requirementSchema);
