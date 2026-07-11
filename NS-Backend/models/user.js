const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      default: "",
    },

    google: {
      type: Boolean,
      default: false,
    },

    avatar: {
      type: String,
      default: "",
    },

    phone: {
      type: String,
      default: "",
    },

    companyName: {
      type: String,
      default: "",
    },

    address: {
      type: String,
      default: "",
    },

    website: {
      type: String,
      default: "",
    },

    linkedin: {
      type: String,
      default: "",
    },

    bio: {
      type: String,
      default: "",
    },

    preferredTechnologies: {
      type: [String],
      default: [],
    },

    role: {
      type: String,
      enum: [
        "Client",
        "Business Owner",
        "Project Manager",
        "Designer",
        "Developer",
        "Other",
      ],
      default: "Client",
    },

    settings: {
      theme: { type: String, enum: ["dark", "light"], default: "dark" },
      language: { type: String, default: "English" },
      privacy: { type: String, default: "standard" },
      accountSecurity: { type: String, default: "standard" },
      notifications: {
        email: { type: Boolean, default: true },
        messages: { type: Boolean, default: true },
        meetings: { type: Boolean, default: true },
        projectUpdates: { type: Boolean, default: true },
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
