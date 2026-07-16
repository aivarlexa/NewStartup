const express = require("express");
const Requirement = require("../models/Requirement");
const User = require("../models/user"); // Ensure case-sensitivity matches your file system ("user" vs "User")
const { requireAuth, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

// Enforce authentication context global protection rule for all sub-routes
router.use(requireAuth, requireRole("Developer"));

// 1. Existing Requirements Query Channel
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

// 2. RESTORED: Active Clients Search Handler (Resolves the chat sidebar 404!)
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

// 3. Dynamic Self-Profile Serialization Channel
router.get("/profile", async (req, res) => {
  try {
    // Dynamic Fallback Check: Safely evaluate both _id and id shapes
    const targetUserId = req.user._id || req.user.id;

    const developer = await User.findById(targetUserId).select("-password").lean();

    if (!developer) {
      return res.status(404).json({ success: false, message: "Developer profile not found" });
    }

    // Map your database fields to match the frontend state expectations cleanly
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
        settings: developer.settings || {}
      }
    });
  } catch (error) {
    console.error("Profile fetch processing failure:", error.message);
    res.status(500).json({ success: false, message: "Server error fetching profile details" });
  }
});

module.exports = router;