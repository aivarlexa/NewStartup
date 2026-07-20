const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    // 👑 FIX 1: Remove required: true so role-level alerts (like Admin) can exist without a single user ID
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" 
    },

    // 👑 FIX 2: Add targetRole to identify system-wide alerts for Admins/Clients/Developers
    targetRole: { 
      type: String, 
      enum: ["Admin", "Client", "Developer"],
      default: null 
    },

    type: {
      type: String,
      enum: [
        "New Message", 
        "Meeting Reminder", 
        "Project Updates", 
        "Developer Accepted Request", 
        "Developer Rejected Request", 
        "System Notifications"
      ],
      default: "System Notifications",
    },

    title: { type: String, required: true },
    message: { type: String, default: "" },
    
    // Optional navigation link/route target
    link: { type: String, default: "" },

    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);