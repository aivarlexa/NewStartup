const mongoose = require("mongoose");

const meetingSchema = new mongoose.Schema(
  {
    client: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    developer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    developerName: { type: String, default: "" },
    date: { type: String, required: true },
    time: { type: String, required: true },
    duration: { type: Number, default: 30 },
    meetingLink: { type: String, default: "" },
    meetingType: { type: String, enum: ["Google Meet", "Zoom", "Microsoft Teams"], default: "Google Meet" },
    description: { type: String, default: "" },
    status: { type: String, enum: ["Scheduled", "Completed", "Cancelled"], default: "Scheduled" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ClientMeeting", meetingSchema);
