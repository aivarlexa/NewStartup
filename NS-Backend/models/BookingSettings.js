const mongoose = require("mongoose");

const blockedDateSchema = new mongoose.Schema(
  {
    date: { type: String, required: true },
    reason: { type: String, default: "" },
  },
  { _id: false }
);

const bookingSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: "default", unique: true },
    adminEmail: { type: String, trim: true, lowercase: true, default: "" },
    timezone: { type: String, default: "Asia/Kolkata" },
    workingDays: { type: [Number], default: [0, 1, 2, 3, 4, 5, 6] },
    startTime: { type: String, default: "10:00" },
    endTime: { type: String, default: "18:00" },
    slotStepMinutes: { type: Number, default: 30, min: 5, max: 120 },
    defaultDuration: { type: Number, default: 30, min: 15, max: 240 },
    blockedDates: { type: [blockedDateSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BookingSettings", bookingSettingsSchema);

