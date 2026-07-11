const express = require("express");
const Requirement = require("../models/Requirement");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(requireAuth, requireRole("Developer"));

router.get("/requirements", async (req, res) => {
  const requirements = await Requirement.find({ status: { $in: ["Pending", "Open", "Assigned"] } })
    .populate("client", "name email companyName")
    .sort({ createdAt: -1 })
    .lean();

  res.json({ success: true, requirements });
});

module.exports = router;
