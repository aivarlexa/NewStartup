const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const { requireAuth } = require("../middleware/authMiddleware");

// Enforce auth context globally across the message sub-routes matrix
router.use(requireAuth);

// 1. Fetch historical conversation messages sorted chronologically
router.get("/:conversationKey", async (req, res, next) => {
  try {
    const { conversationKey } = req.params;

    const messages = await Message.find({ conversationKey })
      .populate("sender", "name role")
      .sort({ createdAt: 1 });

    res.json({ success: true, messages });
  } catch (error) {
    next(error);
  }
});

// 2. HTTP Fallback Endpoint to Post a New Message
router.post("/:conversationKey", async (req, res, next) => {
  try {
    const { conversationKey } = req.params;
    const { text, client, developer, attachments } = req.body;
    const userId = req.user._id || req.user.id;

    if (!text && !attachments?.length) {
      return res.status(400).json({ success: false, message: "Message cannot be empty." });
    }

    const newMessage = await Message.create({
      conversationKey,
      client: client || null,
      developer: developer || null,
      sender: userId,
      text: text || "",
      attachments: attachments || [],
      seenBy: [userId],
    });

    const populatedMessage = await Message.findById(newMessage._id)
      .populate("sender", "name role");

    // Optional: Emit to socket connections if socket server is bound globally
    const io = req.app.get("io");
    if (io) {
      io.to(`conversation:${conversationKey}`).emit("message:new", populatedMessage);
    }

    res.status(201).json({ success: true, message: populatedMessage });
  } catch (error) {
    next(error);
  }
});

// 3. Mark messages as read for a specific conversation
router.post("/:conversationKey/seen", async (req, res, next) => {
  try {
    const { conversationKey } = req.params;
    const userId = req.user._id || req.user.id;

    await Message.updateMany(
      { 
        conversationKey, 
        seenBy: { $ne: userId }
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