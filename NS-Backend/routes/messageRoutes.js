const express = require("express");
const router = express.Router();
const Message = require("../models/Message"); // Path to your message model

// 1. Fetch historical conversation messages sorted chronologically
router.get("/:conversationKey", async (req, res, next) => {
  try {
    const { conversationKey } = req.params;

    const messages = await Message.find({ conversationKey })
      .populate("sender", "name role")
      .sort({ createdAt: 1 }); // Oldest to newest for chat layout

    res.json({ success: true, messages });
  } catch (error) {
    next(error);
  }
});

// 2. Mark messages as read for a specific conversation
router.post("/:conversationKey/seen", async (req, res, next) => {
  try {
    const { conversationKey } = req.params;
    const userId = req.user.id; // Populated by your auth middleware

    await Message.updateMany(
      { 
        conversationKey, 
        seenBy: { $ne: userId } // Only update documents where user hasn't seen it yet
      },
      { 
        $addToSet: { seenBy: userId } 
      }
    );

    res.json({ success: true, message: "Conversation marked as read." });
  } catch (error) {
    next(error);
  }
});

module.exports = router;