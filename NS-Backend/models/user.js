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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);