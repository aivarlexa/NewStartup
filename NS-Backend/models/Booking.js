const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    company: { type: String, trim: true, default: "" },
    purpose: { type: String, required: true, trim: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    duration: { type: Number, required: true, min: 15, max: 240 },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    status: {
      type: String,
      enum: ["scheduled", "cancelled", "completed"],
      default: "scheduled",
    },
    googleEventId: { type: String, default: "" },
    meetLink: { type: String, default: "" },
    calendarHtmlLink: { type: String, default: "" },
    cancellationReason: { type: String, default: "" },
  },
  { timestamps: true }
);

bookingSchema.index({ start: 1, end: 1, status: 1 });
bookingSchema.index({ email: 1, start: 1 });

module.exports = mongoose.model("Booking", bookingSchema);
