const mongoose = require("mongoose");

const meetingSchema = new mongoose.Schema(
  {
    // 🔗 Core Identity Mappings
    client: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    developer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    
    // 👤 Notification Metadata Cache (Prevents email template undefined properties)
    clientName: { type: String, default: "" },
    clientEmail: { type: String, default: "" },
    purpose: { type: String, default: "" }, // Maps cleanly into booking.purpose references
    developerName: { type: String, default: "" },

    // 📅 Date & Timing Parameters
    date: { type: String, required: true },
    time: { type: String, required: true },
    duration: { type: Number, default: 30 },

    // 🎥 Video Channel Identifiers
    meetingLink: { type: String, default: "" },
    // Removed strict enum constraints on meetingType to safely support your Whereby room pipelines
    meetingType: { type: String, default: "Google Meet" },

    // ⚙️ Status Telemetry
    description: { type: String, default: "" },
    status: { type: String, enum: ["Scheduled", "Completed", "Cancelled"], default: "Scheduled" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ClientMeeting", meetingSchema);