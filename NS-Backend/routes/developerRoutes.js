const express = require("express");
const Requirement = require("../models/Requirement");
const Message = require("../models/Message");
const ClientMeeting = require("../models/ClientMeeting");
const User = require("../models/user"); // Ensure case-sensitivity matches your file system ("user" vs "User")
const { requireAuth, requireRole } = require("../middleware/authMiddleware");

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

module.exports = router;