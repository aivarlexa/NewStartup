const express = require("express");
const Requirement = require("../models/Requirement");
const Message = require("../models/Message");
const ClientMeeting = require("../models/ClientMeeting");
const Notification = require("../models/Notification");
const User = require("../models/user");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

function splitList(value) {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  return String(value || "").split(",").map((item) => item.trim()).filter(Boolean);
}

function normalizeRequirement(requirement) {
  return {
    id: requirement._id,
    projectTitle: requirement.projectTitle,
    category: requirement.category,
    description: requirement.description,
    skillsRequired: requirement.skillsRequired,
    technologyStack: requirement.technologyStack,
    budget: requirement.budget,
    deadline: requirement.deadline,
    priority: requirement.priority,
    projectType: requirement.projectType,
    experienceRequired: requirement.experienceRequired,
    attachments: requirement.attachments,
    additionalNotes: requirement.additionalNotes,
    status: requirement.status,
    createdAt: requirement.createdAt,
    updatedAt: requirement.updatedAt,
  };
}

function normalizeMeeting(meeting) {
  return {
    id: meeting._id,
    developer: meeting.developer,
    developerName: meeting.developerName,
    date: meeting.date,
    time: meeting.time,
    duration: meeting.duration,
    meetingLink: meeting.meetingLink,
    meetingType: meeting.meetingType,
    description: meeting.description,
    status: meeting.status,
    createdAt: meeting.createdAt,
  };
}

function normalizeNotification(notification) {
  return {
    id: notification._id,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    read: notification.read,
    createdAt: notification.createdAt,
  };
}

// Global protection middleware for client routes
router.use(requireAuth, requireRole("Client"));

// 1. DYNAMIC SUMMARY DISPATCH ENGINE (Fixes the Unread Message Counter Bug)
router.get("/summary", async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    // Concurrently gather counts to maximize query performance
    const [requirements, unreadMessages, upcomingMeetings, notifications] = await Promise.all([
      Requirement.find({ client: userId }).sort({ updatedAt: -1 }).lean(),
      
      // FIX: Only count messages where the client is NOT the sender AND hasn't seen it yet
      Message.countDocuments({ 
        client: userId, 
        sender: { $ne: userId }, // Must be sent by a Developer
        seenBy: { $ne: userId }  // Client has not marked it read
      }),
      
      ClientMeeting.countDocuments({ client: userId, status: "Scheduled" }),
      Notification.find({ user: userId }).sort({ createdAt: -1 }).limit(6).lean(),
    ]);

    res.json({
      success: true,
      summary: {
        activeProjects: requirements.filter((item) => ["Open", "Assigned"].includes(item.status)).length,
        pendingRequests: requirements.filter((item) => item.status === "Pending").length,
        completedProjects: requirements.filter((item) => item.status === "Completed").length,
        unreadMessages,
        upcomingMeetings,
        recentNotifications: notifications.filter((item) => !item.read).length,
      },
      latestActivity: requirements.slice(0, 5).map((item) => `${item.projectTitle} is ${item.status}`),
      notifications: notifications.map(normalizeNotification),
    });
  } catch (error) {
    console.error("Summary processing failure:", error.message);
    res.status(500).json({ success: false, message: "Internal server error gathering summary metrics." });
  }
});

router.get("/requirements", async (req, res) => {
  const userId = req.user._id || req.user.id;
  const requirements = await Requirement.find({ client: userId }).sort({ updatedAt: -1 });
  res.json({ success: true, requirements: requirements.map(normalizeRequirement) });
});

router.post("/requirements", async (req, res) => {
  const userId = req.user._id || req.user.id;
  const status = req.body.status === "Draft" ? "Draft" : "Pending";

  if (!req.body.projectTitle || !req.body.description) {
    return res.status(400).json({ success: false, message: "Project title and description are required." });
  }

  const requirement = await Requirement.create({
    client: userId,
    projectTitle: req.body.projectTitle,
    category: req.body.category,
    description: req.body.description,
    skillsRequired: splitList(req.body.skillsRequired),
    technologyStack: splitList(req.body.technologyStack),
    budget: req.body.budget,
    deadline: req.body.deadline,
    priority: req.body.priority || "Medium",
    projectType: req.body.projectType,
    experienceRequired: req.body.experienceRequired,
    attachments: splitList(req.body.attachments),
    additionalNotes: req.body.additionalNotes,
    status,
  });

  await Notification.create({
    user: userId,
    type: "Project Updates",
    title: status === "Draft" ? "Requirement draft saved" : "Requirement submitted",
    message: requirement.projectTitle,
  });

  res.status(201).json({ success: true, requirement: normalizeRequirement(requirement) });
});

router.get("/developers", async (req, res) => {
  const developers = await User.find({ role: "Developer" }).select("name email avatar bio preferredTechnologies").sort({ name: 1 }).lean();
  res.json({ success: true, developers });
});

router.get("/messages", async (req, res) => {
  const userId = req.user._id || req.user.id;
  const developerId = req.query.developerId;
  const query = { client: userId };
  if (developerId) query.developer = developerId;
  const messages = await Message.find(query).sort({ createdAt: 1 }).populate("sender", "name role").lean();
  res.json({ success: true, messages });
});

// SYNCED CHAT ROUTE DISPATCH SYSTEM
router.post("/messages", async (req, res) => {
  const userId = req.user._id || req.user.id;
  if (!req.body.text && !req.body.emoji && !req.body.attachments?.length) {
    return res.status(400).json({ success: false, message: "Message cannot be empty." });
  }

  const developerId = req.body.developerId || null;
  const message = await Message.create({
    conversationKey: `${userId}:${developerId || "general"}`,
    client: userId,
    developer: developerId,
    sender: userId,
    text: req.body.text || "",
    emoji: req.body.emoji || "",
    attachments: req.body.attachments || [],
    seenBy: [userId],
  });

  await Notification.create({
    user: userId,
    type: "New Message",
    title: "Message sent",
    message: message.text || "Attachment shared",
    read: true,
  });

  // Populate message sender info cleanly before sending out down the socket line
  const populatedMessage = await Message.findById(message._id)
    .populate("sender", "name role")
    .lean();

  const io = req.app.get("io");
  if (io) {
    // 1. Emit directly to focused window channel room 
    io.to(`conversation:${message.conversationKey}`).emit("message:new", populatedMessage);

    // 2. WHATSAPP STYLE SYNC LAYER: Send to developer's explicit background room channel
    if (developerId) {
      io.to(`user:${developerId}`).emit("message:new", populatedMessage);
    }
  }

  res.status(201).json({ success: true, message: populatedMessage });
});

router.get("/meetings", async (req, res) => {
  const userId = req.user._id || req.user.id;
  const meetings = await ClientMeeting.find({ client: userId }).sort({ date: 1, time: 1 });
  res.json({ success: true, meetings: meetings.map(normalizeMeeting) });
});

router.post("/meetings", async (req, res) => {
  const userId = req.user._id || req.user.id;
  if (!req.body.date || !req.body.time) {
    return res.status(400).json({ success: false, message: "Date and time are required." });
  }

  const meeting = await ClientMeeting.create({
    client: userId,
    developer: req.body.developer || undefined,
    developerName: req.body.developerName || "",
    date: req.body.date,
    time: req.body.time,
    duration: Number(req.body.duration || 30),
    meetingLink: req.body.meetingLink || "",
    meetingType: req.body.meetingType || "Google Meet",
    description: req.body.description || "",
  });

  await Notification.create({
    user: userId,
    type: "Meeting Reminder",
    title: "Meeting scheduled",
    message: `${meeting.date} at ${meeting.time}`,
  });

  res.status(201).json({ success: true, meeting: normalizeMeeting(meeting) });
});

router.patch("/meetings/:id", async (req, res) => {
  const userId = req.user._id || req.user.id;
  const meeting = await ClientMeeting.findOneAndUpdate(
    { _id: req.params.id, client: userId },
    { $set: req.body },
    { returnDocument: "after", runValidators: true }
  );

  if (!meeting) return res.status(404).json({ success: false, message: "Meeting not found." });
  res.json({ success: true, meeting: normalizeMeeting(meeting) });
});

router.get("/notifications", async (req, res) => {
  const userId = req.user._id || req.user.id;
  const { type, search } = req.query;
  const query = { user: userId };
  if (type && type !== "All") query.type = type;
  if (search) query.$or = [{ title: new RegExp(search, "i") }, { message: new RegExp(search, "i") }];
  const notifications = await Notification.find(query).sort({ createdAt: -1 });
  res.json({ success: true, notifications: notifications.map(normalizeNotification) });
});

router.patch("/notifications/:id/read", async (req, res) => {
  const userId = req.user._id || req.user.id;
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: userId }, 
    { read: true }, 
    { returnDocument: "after" }
  );
  if (!notification) return res.status(404).json({ success: false, message: "Notification not found." });
  res.json({ success: true, notification: normalizeNotification(notification) });
});

router.delete("/notifications/:id", async (req, res) => {
  const userId = req.user._id || req.user.id;
  await Notification.deleteOne({ _id: req.params.id, user: userId });
  res.json({ success: true });
});

router.get("/profile", (req, res) => {
  res.json({ success: true, profile: req.user });
});

router.put("/profile", async (req, res) => {
  const userId = req.user._id || req.user.id;
  const allowed = ["name", "phone", "companyName", "address", "website", "linkedin", "bio", "avatar", "preferredTechnologies"];
  const updates = {};
  allowed.forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(req.body, key)) updates[key] = key === "preferredTechnologies" ? splitList(req.body[key]) : req.body[key];
  });
  const user = await User.findByIdAndUpdate(
    userId, 
    updates, 
    { returnDocument: "after", runValidators: true }
  ).select("name email role avatar phone companyName address website linkedin bio preferredTechnologies settings");
  res.json({ success: true, profile: user });
});

router.get("/settings", (req, res) => {
  res.json({ success: true, settings: req.user.settings });
});

router.put("/settings", async (req, res) => {
  const userId = req.user._id || req.user.id;
  const user = await User.findByIdAndUpdate(
    userId, 
    { settings: req.body }, 
    { returnDocument: "after", runValidators: true }
  ).select("settings");
  res.json({ success: true, settings: user.settings });
});

module.exports = router;