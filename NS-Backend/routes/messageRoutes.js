const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const User = require("../models/user"); // 👑 FIX 1: Explicitly import the User model to resolve crashes!
const { requireAuth } = require("../middleware/authMiddleware");

// Enforce auth context globally across the message sub-routes matrix
router.use(requireAuth);

// 1. GET /api/messages/chat-directory -> Fetches the sidebar user roster for Clients/Developers
router.get("/chat-directory", async (req, res) => {
  try {
    // Fetch standard users (e.g., developers see clients, clients see developers)
    const targetRole = req.user.role === "Client" ? "Developer" : "Client";
    const normalUsers = await User.find({ role: targetRole, status: "Active" })
      .select("name email companyName status")
      .lean();

    // Fetch the system Admin account context explicitly
    const adminUser = await User.findOne({ role: "Admin" })
      .select("name email status")
      .lean();

    const responseDirectory = [...normalUsers];

    // Inject the Admin at the front of the list if it exists
    if (adminUser) {
      responseDirectory.unshift({
        ...adminUser,
        name: "System Administrator (Varlexa)",
        companyName: "Internal Management",
        isSystemAdmin: true // Flag to identify admin on frontend layout panels
      });
    }

    res.json({ success: true, users: responseDirectory });
  } catch (error) {
    console.error("Chat directory compilation failure:", error);
    res.status(500).json({ success: false, message: "Error compiling chat directory." });
  }
});

// 2. POST /api/messages/team_channel_:projectId -> Saves and broadcasts channel team chats
// 👑 FIX 2: Fixed sub-path suffix mapping layout to eliminate duplicate /messages patterns
router.post("/team_channel_:projectId", async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { projectId } = req.params;
    const { text } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({ success: false, message: "Message content cannot be blank." });
    }

    // Map payload explicitly following your unified Message collection layout requirements
    const channelMessage = await Message.create({
      conversationKey: `team_channel_${projectId}`,
      sender: userId,
      text: text.trim(),
      seenBy: [userId]
    });

    const populatedMessage = await Message.findById(channelMessage._id)
      .populate("sender", "name role")
      .lean();

    const io = req.app.get("io");
    if (io) {
      // Broadcast live to everyone tuned into the active project channel room
      io.to(`conversation:team_channel_${projectId}`).emit("message:new", populatedMessage);
    }

    res.status(201).json({ success: true, message: populatedMessage });
  } catch (error) {
    console.error("Channel communication error:", error);
    res.status(500).json({ success: false, message: "Server error broadcasting team message." });
  }
});

// 3. GET /api/messages/team_channel_:projectId -> Loads historical message lines inside the room
router.get("/team_channel_:projectId", async (req, res) => {
  try {
    const { projectId } = req.params;
    const messages = await Message.find({ conversationKey: `team_channel_${projectId}` })
      .sort({ createdAt: 1 })
      .populate("sender", "name role")
      .lean();

    res.json({ success: true, messages: messages || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching channel logs." });
  }
});

// 4. GET /api/messages/:conversationKey -> Fetch historical conversation messages sorted chronologically
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

// 5. POST /api/messages/:conversationKey -> HTTP Fallback Endpoint to Post a New Message
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

// 6. POST /api/messages/:conversationKey/seen -> Mark messages as read for a specific conversation
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