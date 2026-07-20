const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Requirement = require("../models/Requirement");
const Message = require("../models/Message");
const Notification = require("../models/Notification");
const Task = require("../models/Task");

const buildConversationKey = (userId) => `admin_${userId}`;

const {
  requireAuth,
  requireRole,
} = require("../middleware/authMiddleware");

const {
  getDashboard,
} = require("../controller/adminController");

// 1. Enforce Authentication globally for ALL endpoints below
router.use(requireAuth);

// =========================================================================
//  🔒 SECURE ADMIN-ONLY ENDPOINTS (requireRole("Admin") placed explicitly)
// =========================================================================

router.get("/dashboard", requireRole("Admin"), getDashboard);

router.get("/analytics-summary", requireRole("Admin"), async (req, res) => {
  try {
    const [completedCount, allProjects] = await Promise.all([
      Requirement.countDocuments({ status: "Completed" }),
      Requirement.find({}).lean()
    ]);
    let totalRevenueSum = 0;
    allProjects.forEach((proj) => {
      if (proj.budget) {
        const cleanNum = parseFloat(String(proj.budget).replace(/[^0-9.]/g, ""));
        if (!isNaN(cleanNum)) totalRevenueSum += cleanNum;
      }
    });
    const revenueDisplay = totalRevenueSum > 0 ? `₹${totalRevenueSum.toLocaleString("en-IN")}` : "₹0";
    res.json({
      success: true,
      summary: {
        completedProjects: completedCount,
        totalRevenue: revenueDisplay,
        successRate: allProjects.length > 0 ? `${Math.round((completedCount / allProjects.length) * 100)}%` : "100%"
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error compiling report." });
  }
});

router.get("/clients", requireRole("Admin"), async (req, res) => {
  try {
    const clients = await User.find({ role: "Client" }).select("name email companyName phone address status").lean();
    res.json({ success: true, clients });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error compiling clients roster." });
  }
});

router.get("/developers", requireRole("Admin"), async (req, res) => {
  try {
    const developers = await User.find({ role: "Developer" }).select("name email preferredTechnologies availability status").lean();
    res.json({ success: true, developers });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error compiling engineers workspace." });
  }
});

router.get("/projects", requireRole("Admin"), async (req, res) => {
  try {
    const projects = await Requirement.find({})
      .populate({ path: "client", select: "name companyName email", model: "User" })
      .populate({ path: "team", select: "name email availability preferredTechnologies status", model: "User" })
      .populate({ path: "lead", select: "name email", model: "User" })
      .lean();
    res.json({ success: true, projects });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error compiling project logs configuration." });
  }
});

router.patch("/projects/:id/status", requireRole("Admin"), async (req, res) => {
  try {
    const updatedProject = await Requirement.findByIdAndUpdate(req.params.id, { $set: { status: req.body.status } }, { new: true });
    res.json({ success: true, project: updatedProject });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error setting status." });
  }
});

router.patch("/clients/:clientId/status", requireRole("Admin"), async (req, res) => {
  try {
    const updatedClient = await User.findByIdAndUpdate(req.params.clientId, { $set: { status: req.body.status } }, { new: true });
    res.json({ success: true, client: updatedClient });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error updating client status." });
  }
});

router.delete("/clients/:clientId", requireRole("Admin"), async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.clientId);
    res.json({ success: true, message: "Client scrubbed successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Removal fault." });
  }
});
router.put("/clients/:clientId", requireRole("Admin"), async (req, res) => {
  try {
    const updatedClient = await User.findByIdAndUpdate(req.params.clientId, { $set: req.body }, { new: true });
    res.json({ success: true, client: updatedClient });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error updating client." });
  }
});

router.put("/projects/:id/assign", requireRole("Admin"), async (req, res) => {
  try {
    const updatedProject = await Requirement.findByIdAndUpdate(req.params.id, { $set: { team: req.body.team, lead: req.body.lead } }, { new: true });
    res.json({ success: true, project: updatedProject });
  } catch (error) {
    res.status(500).json({ success: false, message: "Write allocation fault." });
  }
});

// =========================================================================
//  💬 OPEN COMMUNICATION ROUTING (Accessible by Admin, Client, & Developer)
// =========================================================================

// GET /api/admin/messages/:userId
router.get("/messages/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Security layer: Block cross-user viewing unless requester is Admin
    if (req.user.role !== "Admin" && String(req.user._id) !== String(userId)) {
      return res.status(403).json({ success: false, message: "Unauthorized access to thread." });
    }

    const targetKey = buildConversationKey(userId);
    const messages = await Message.find({ conversationKey: targetKey }).sort({ createdAt: 1 }).lean();
    res.json({ success: true, messages: messages || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error reading message streams." });
  }
});

// POST /api/admin/messages/:userId
router.post("/messages/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { text } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({ success: false, message: "Message cannot be empty." });
    }

    if (req.user.role !== "Admin" && String(req.user._id) !== String(userId)) {
      return res.status(403).json({ success: false, message: "Unauthorized communication transaction." });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: "Recipient user not found." });
    }

    const targetKey = buildConversationKey(userId);
    const messagePayload = {
      conversationKey: targetKey,
      sender: req.user._id,
      text: text,
      seenBy: [req.user._id]
    };

    if (targetUser.role === "Client" || req.user.role === "Client") {
      messagePayload.client = req.user.role === "Client" ? req.user._id : targetUser._id;
    } 
    if (targetUser.role === "Developer" || req.user.role === "Developer") {
      messagePayload.developer = req.user.role === "Developer" ? req.user._id : targetUser._id;
    }

    const newMessage = new Message(messagePayload);
    await newMessage.save();

    const io = req.app.get("io");
    if (io) {
      io.to(`conversation:${targetKey}`).emit("message:new", newMessage);
      io.to(`user:${userId}`).emit("message:new", newMessage);
      if (req.user.role !== "Admin") {
        io.to("role:Admin").emit("message:new", newMessage);
      }
    }

    res.status(201).json({ success: true, message: newMessage });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to persist conversation entry context." });
  }
});

// =========================================================================
//  🔔 ADMINISTRATIVE SYSTEM TELEMETRY ALERTS ENDPOINTS
// =========================================================================

// =========================================================================
//  🔔 ADMINISTRATIVE SYSTEM TELEMETRY ALERTS ENDPOINTS
// =========================================================================

// GET /api/admin/notifications
router.get("/notifications", requireRole("Admin"), async (req, res) => {
  try {
    const adminId = req.user._id || req.user.id;

    // 👑 BROAD MATCH QUERY: Finds direct admin IDs, role-based "Admin" alerts, OR unassigned system alerts
    const notifications = await Notification.find({
      $or: [
        { targetRole: "Admin" },
        { user: adminId },
        { user: { $exists: false } },
        { user: null }
      ]
    })
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

    console.log(`[Admin Notifications] Found ${notifications.length} alerts for Admin ID: ${adminId}`);

    return res.json({ success: true, notifications: notifications || [] });
  } catch (error) {
    console.error("Fetch admin notifications error:", error);
    return res.status(500).json({ success: false, message: "Error compiling system telemetry notifications." });
  }
});

// PATCH /api/admin/notifications/:id/read
router.patch("/notifications/:id/read", requireRole("Admin"), async (req, res) => {
  try {
    const updated = await Notification.findByIdAndUpdate(
      req.params.id,
      { $set: { read: true } },
      { new: true }
    );
    return res.json({ success: true, notification: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to mark system alert context as read." });
  }
});

// POST /api/admin/notifications/mark-all-read
router.post("/notifications/mark-all-read", requireRole("Admin"), async (req, res) => {
  try {
    await Notification.updateMany(
      { 
        $or: [ { user: req.user._id }, { targetRole: "Admin" } ],
        read: false 
      },
      { $set: { read: true } }
    );
    return res.json({ success: true, message: "All administrative notification logs flagged read." });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Bulk patch validation error." });
  }
});

// DELETE /api/admin/notifications/:id
router.delete("/notifications/:id", requireRole("Admin"), async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: "Notification context discarded clean." });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to delete target alert registry node." });
  }
});

// GET /api/admin/tasks
router.get("/tasks", async (req, res) => {
  try {
    const tasks = await Task.find({})
      .populate("project", "projectTitle name")
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, tasks: tasks || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error loading task list." });
  }
});

// POST /api/admin/tasks
router.post("/tasks", async (req, res) => {
  try {
    const task = await Task.create(req.body);
    const populated = await Task.findById(task._id)
      .populate("project", "projectTitle name")
      .populate("assignedTo", "name email")
      .lean();

    // Notify developer if assigned
    if (req.body.assignedTo) {
      await Notification.create({
        user: req.body.assignedTo,
        type: "Project Updates",
        title: "New Task Assigned",
        message: `Task: "${task.title}" has been assigned to you.`,
      });
    }

    res.status(201).json({ success: true, task: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error creating task." });
  }
});

// PATCH /api/admin/tasks/:id/status
router.patch("/tasks/:id/status", async (req, res) => {
  try {
    const updated = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: { status: req.body.status } },
      { new: true }
    );
    res.json({ success: true, task: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating task status." });
  }
});

// DELETE /api/admin/tasks/:id
router.delete("/tasks/:id", async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Task deleted." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting task." });
  }
});

module.exports = router;