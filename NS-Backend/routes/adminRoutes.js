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

// 2. GET /api/admin/analytics-summary -> Fetch dashboard analysis metrics
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
// 5. UPDATED: GET /api/admin/projects -> Robust deep population engine layer
router.get("/projects", async (req, res) => {
  try {
    const projects = await Requirement.find({})
      .populate({
        path: "client",
        select: "name companyName email",
        model: "User"
      })
      .populate({
        path: "team",
        select: "name email availability preferredTechnologies status",
        model: "User"
      })
      .populate({
        path: "lead",
        select: "name email",
        model: "User"
      })
      .lean();

    res.json({ success: true, projects });
  } catch (error) {
    console.error("Critical population sequence mapping fault:", error);
    res.status(500).json({ success: false, message: "Error compiling structural project logs configuration." });
  }
});

// 6. PATCH /api/admin/projects/:id/status -> Receive the project structural status ticks
router.patch("/projects/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const updatedProject = await Requirement.findByIdAndUpdate(
      req.params.id,
      { $set: { status } },
      { new: true }
    );
    res.json({ success: true, project: updatedProject });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error setting application state validation flags." });
  }
});

// 7. FIXES YOUR CLIENT SELECTION BUG: PATCH /api/admin/clients/:clientId/status
router.patch("/clients/:clientId/status", async (req, res) => {
  try {
    const { clientId } = req.params;
    const { status } = req.body; // Expects "Active" or "Suspended"

    if (!["Active", "Suspended"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status parameter value." });
    }

    const updatedClient = await User.findByIdAndUpdate(
      clientId,
      { $set: { status: status } },
      { new: true }
    );

    if (!updatedClient) {
      return res.status(404).json({ success: false, message: "Client profile document not found." });
    }

    res.json({ success: true, message: "Client status updated successfully.", client: updatedClient });
  } catch (error) {
    console.error("Client status update engine failure:", error.message);
    res.status(500).json({ success: false, message: "Server database state transition update failure." });
  }
});

// 8. DELETE /api/admin/clients/:clientId -> Permanently remove a client profile
router.delete("/clients/:clientId", async (req, res) => {
  try {
    const { clientId } = req.params;

    const deletedClient = await User.findByIdAndDelete(clientId);

    if (!deletedClient) {
      return res.status(404).json({ success: false, message: "Client profile document not found." });
    }

    res.json({ success: true, message: "Client document scrubbed successfully." });
  } catch (error) {
    console.error("Client deletion engine failure:", error.message);
    res.status(500).json({ success: false, message: "Server database engine removal fault." });
  }
});

// PUT /api/admin/projects/:id/assign -> Save developer team allocations
router.put("/projects/:id/assign", async (req, res) => {
  try {
    const { id } = req.params;
    const { team, lead } = req.body; // Expects array of IDs and a single Lead ID string

    const updatedProject = await Requirement.findByIdAndUpdate(
      id,
      { 
        $set: { 
          team: team, 
          lead: lead 
        } 
      },
      { new: true }
    );

    if (!updatedProject) {
      return res.status(404).json({ success: false, message: "Project document registry entry missing." });
    }

    res.json({ success: true, message: "Team sync assignment saved successfully.", project: updatedProject });
  } catch (error) {
    console.error("Assignment updates engine failure:", error.message);
    res.status(500).json({ success: false, message: "Server database write allocation fault occurred." });
  }
});

module.exports = router;