const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    conversationKey: { type: String, required: true, index: true },
    client: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    developer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, default: "" },
    emoji: { type: String, default: "" },
    attachments: [{ name: String, url: String, type: String }],
    seenBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
