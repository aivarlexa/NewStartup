const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Requirement = require("../models/Requirement");

const {
  requireAuth,
  requireRole,
} = require("../middleware/authMiddleware");

const {
  getDashboard,
} = require("../controller/adminController");

// Enforce global protection context for all administrative layout channels
router.use(requireAuth, requireRole("Admin"));

// 1. Existing Dashboard Entry point
router.get("/dashboard", getDashboard);

// 2. NEW: GET /api/admin/analytics-summary -> FIXES YOUR 404 DATA ERROR
router.get("/analytics-summary", async (req, res) => {
  try {
    // Aggregate data sets directly out of your main database collections
    const [completedCount, allProjects] = await Promise.all([
      Requirement.countDocuments({ status: "Completed" }),
      Requirement.find({}).lean()
    ]);

    // Calculate aggregated revenue safely from available budget fields
    let totalRevenueSum = 0;
    allProjects.forEach((proj) => {
      if (proj.budget) {
        // Strip non-numeric currency elements like ₹, commas, L, or text markers if string format
        const cleanNum = parseFloat(String(proj.budget).replace(/[^0-9.]/g, ""));
        if (!isNaN(cleanNum)) {
          totalRevenueSum += cleanNum;
        }
      }
    });

    // Fallback format representation mapping clean numerical results out
    const revenueDisplay = totalRevenueSum > 0 ? `₹${totalRevenueSum.toLocaleString("en-IN")}` : "₹0";

    res.json({
      success: true,
      summary: {
        completedProjects: completedCount,
        totalRevenue: revenueDisplay,
        successRate: allProjects.length > 0 
          ? `${Math.round((completedCount / allProjects.length) * 100)}%` 
          : "100%"
      }
    });
  } catch (error) {
    console.error("Analytics processing aggregation failure:", error.message);
    res.status(500).json({ success: false, message: "Error compiling workspace report diagnostics." });
  }
});

// 3. GET /api/admin/clients -> Fetch all client profiles
router.get("/clients", async (req, res) => {
  try {
    const clients = await User.find({ role: "Client" })
      .select("name email companyName phone address status")
      .lean();

    res.json({ success: true, clients });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error compiling clients roster." });
  }
});

// 4. GET /api/admin/developers -> Fetch all developer arrays
router.get("/developers", async (req, res) => {
  try {
    const developers = await User.find({ role: "Developer" })
      .select("name email preferredTechnologies availability status")
      .lean();

    res.json({ success: true, developers });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error compiling engineers workspace." });
  }
});

// 5. GET /api/admin/projects -> Fetch all project records for the Kanban grid layout mapping
router.get("/projects", async (req, res) => {
  try {
    const projects = await Requirement.find({})
      .populate("client", "name companyName")
      .lean();

    res.json({ success: true, projects });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching ongoing project tracks." });
  }
});

module.exports = router;