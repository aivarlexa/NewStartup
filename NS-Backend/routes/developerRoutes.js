const express = require("express");
const Requirement = require("../models/Requirement");
const Message = require("../models/Message");
const ClientMeeting = require("../models/ClientMeeting");
const User = require("../models/user"); // Ensure case-sensitivity matches your file system ("user" vs "User")
const { requireAuth, requireRole } = require("../middleware/authMiddleware");
const Notification = require("../models/Notification");

const router = express.Router();

// Enforce authentication context global protection rule for all sub-routes
router.use(requireAuth, requireRole("Developer"));

// 1. DYNAMIC SUMMARY DISPATCH ENGINE (Fixes the /api/developer/summary 404!)
router.get("/summary", async (req, res) => {
  try {
    const developerId = req.user._id || req.user.id;

    // Concurrently gather counts to maximize query performance
    const [requirements, unreadMessages, upcomingMeetings] = await Promise.all([
      Requirement.find({ status: { $in: ["Open", "Assigned"] } }).lean(),
      Message.countDocuments({
        developer: developerId,
        sender: { $ne: developerId }, // Must be sent by a Client
        seenBy: { $ne: developerId }  // Developer has not marked it read
      }),
      ClientMeeting.find({ developer: developerId, status: "Scheduled" })
        .sort({ date: 1, time: 1 })
        .lean()
    ]);

    // Format metrics out precisely to match frontend configuration matrix properties
    res.json({
      success: true,
      summary: {
        activeProjects: requirements.filter(r => r.developer && String(r.developer) === String(developerId)).length,
        pendingTasks: requirements.filter(r => r.status === "Open").length, // Total marketplace available tasks
        unreadMessages,
        upcomingMeetings: upcomingMeetings.length,
      },
      latestActivity: requirements.slice(0, 5).map(r => `Requirement "${r.projectTitle || 'Untitled'}" status is ${r.status}`),
      meetings: upcomingMeetings.map(meeting => ({
        id: meeting._id,
        description: meeting.description || "Project Consultation",
        developerName: meeting.developerName || "Client Briefing",
        date: meeting.date,
        time: meeting.time,
        duration: meeting.duration || 30,
        meetingLink: meeting.meetingLink || ""
      }))
    });
  } catch (error) {
    console.error("Developer summary processing failure:", error.message);
    res.status(500).json({ success: false, message: "Internal server error compiling workspace metrics." });
  }
});

// 2. Existing Requirements Query Channel
router.get("/requirements", async (req, res) => {
  try {
    const requirements = await Requirement.find({ status: { $in: ["Pending", "Open", "Assigned"] } })
      .populate("client", "name email companyName")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, requirements });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching requirements." });
  }
});

// 3. Active Clients Search Handler
router.get("/clients", async (req, res) => {
  try {
    const clients = await User.find({ role: "Client" })
      .select("name email companyName avatar phone")
      .sort({ name: 1 })
      .lean();

    res.json({ success: true, clients });
  } catch (error) {
    console.error("Developer clients fetch error:", error.message);
    res.status(500).json({ success: false, message: "Internal server error fetching client lists." });
  }
});

// 4. Dynamic Self-Profile Serialization Channel
router.get("/profile", async (req, res) => {
  try {
    const targetUserId = req.user._id || req.user.id;
    const developer = await User.findById(targetUserId).select("-password").lean();

    if (!developer) {
      return res.status(404).json({ success: false, message: "Developer profile not found" });
    }

    res.json({
      success: true,
      profile: {
        id: developer._id,
        name: developer.name,
        role: developer.role || "Developer",
        email: developer.email,
        phone: developer.phone || "",
        companyName: developer.companyName || "",
        address: developer.address || "",
        website: developer.website || "",
        linkedin: developer.linkedin || "",
        bio: developer.bio || "",
        preferredTechnologies: developer.preferredTechnologies || [],
        avatar: developer.avatar || "",
        settings: developer.settings || {}
      }
    });
  } catch (error) {
    console.error("Profile fetch processing failure:", error.message);
    res.status(500).json({ success: false, message: "Server error fetching profile details" });
  }
});

// 5. Update Developer Profile Data Channel
router.put("/profile", async (req, res) => {
  try {
    const targetUserId = req.user._id || req.user.id;

    // Strict whitelist control over incoming developer body payload modifications
    const allowedFields = [
      "name",
      "phone",
      "address",
      "website",
      "linkedin",
      "bio",
      "preferredTechnologies",
      "avatar"
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Execute atomic document update step mapping directly onto verified user IDs
    const updatedDeveloper = await User.findByIdAndUpdate(
      targetUserId,
      { $set: updates },
      { returnDocument: "after", runValidators: true }
    ).select("-password").lean();

    if (!updatedDeveloper) {
      return res.status(404).json({ success: false, message: "Developer profile record not found." });
    }

    res.json({
      success: true,
      profile: {
        id: updatedDeveloper._id,
        name: updatedDeveloper.name,
        role: updatedDeveloper.role || "Developer",
        email: updatedDeveloper.email,
        phone: updatedDeveloper.phone || "",
        companyName: updatedDeveloper.companyName || "",
        address: updatedDeveloper.address || "",
        website: updatedDeveloper.website || "",
        linkedin: updatedDeveloper.linkedin || "",
        bio: updatedDeveloper.bio || "",
        preferredTechnologies: updatedDeveloper.preferredTechnologies || [],
        avatar: updatedDeveloper.avatar || "",
        settings: updatedDeveloper.settings || {}
      }
    });
  } catch (error) {
    console.error("Profile update processing failure:", error.message);
    res.status(500).json({ success: false, message: "Server error saving profile updates." });
  }
});

// =========================================================================
//  🛠️ DEVELOPER ASSIGNED PROJECTS CHANNEL (Fixes Team Chat 404)
// =========================================================================

// GET /api/developer/projects -> Fetches all active project channels a developer belongs to
router.get("/projects", async (req, res) => {
  try {
    const developerId = req.user._id || req.user.id;

    // Find all projects where this developer is part of the team array OR is designated as the lead
    const assignedProjects = await Requirement.find({
      $or: [
        { team: developerId },
        { lead: developerId }
      ]
    })
    .populate({
      path: "client",
      select: "name companyName email",
      model: "User"
    })
    .populate({
      path: "lead",
      select: "name email",
      model: "User"
    })
    .lean();

    res.json({ success: true, projects: assignedProjects || [] });
  } catch (error) {
    console.error("Developer projects query sequence fault:", error.message);
    res.status(500).json({ success: false, message: "Error compiling assigned team project matrices." });
  }
});

router.get("/notifications", async (req, res) => {
  try {
    const developerId = req.user._id || req.user.id;
    const notifications = await Notification.find({ user: developerId })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    res.json({ success: true, notifications: notifications || [] });
  } catch (error) {
    console.error("Developer notifications fetch error:", error);
    res.status(500).json({ success: false, message: "Error loading notifications." });
  }
});

// PATCH /api/developer/notifications/mark-all-read -> Marks all as read
router.patch("/notifications/mark-all-read", async (req, res) => {
  try {
    const developerId = req.user._id || req.user.id;
    await Notification.updateMany(
      { user: developerId, read: false },
      { $set: { read: true } }
    );
    res.json({ success: true, message: "All notifications marked as read." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to mark notifications read." });
  }
});

module.exports = router;