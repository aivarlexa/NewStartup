const express = require("express");
const router = express.Router();
const { requireAuth, requireRole } = require("../middleware/authMiddleware");
const bookingController = require("../controller/bookingController");

router.get("/settings", bookingController.getSettings);
router.get("/slots", bookingController.getAvailableSlots);
router.post("/", bookingController.createBooking);
router.get("/google/auth-url", bookingController.googleAuthUrl);
router.get("/google/callback", bookingController.googleCallback);

console.log({
  getSettings: typeof bookingController.getSettings,
  getAvailableSlots: typeof bookingController.getAvailableSlots,
  createBooking: typeof bookingController.createBooking,
  googleAuthUrl: typeof bookingController.googleAuthUrl,
  googleCallback: typeof bookingController.googleCallback,
  listBookings: typeof bookingController.listBookings,
  updateSettings: typeof bookingController.updateSettings,
  rescheduleBooking: typeof bookingController.rescheduleBooking,
  cancelBooking: typeof bookingController.cancelBooking,
});

// =========================================================================
//  👑 ADAPTIVE MANAGEMENT WORKSPACE ENDPOINTS (Bypasses 403 blocks)
// =========================================================================

// GET /api/bookings/admin -> Unified route allowing Admin oversight, plus restricted Client/Dev viewing
router.get(
  "/admin",
  requireAuth,
  async (req, res, next) => {
    // 1. If they are an Admin, let them pass right through to list all records
    if (req.user.role === "Admin") {
      return next();
    }

    // 2. If they are a Client or Developer, intercept and force-inject their ID filter parameters
    if (req.user.role === "Client" || req.user.role === "Developer") {
      // We explicitly override the request query parameters so that listBookings()
      // only searches documents attached to this specific user profile instance.
      req.query.userRestrictionId = req.user._id || req.user.id;
      req.query.userRestrictionRole = req.user.role;
      return next();
    }

    // 3. Fallback rejection for completely unrecognized or unassigned roles
    return res.status(403).json({ success: false, message: "Access denied. Invalid ecosystem credentials." });
  },
  bookingController.listBookings
);

// Keep your strict Admin modifications securely gated below it
router.put("/admin/settings", requireAuth, requireRole("Admin"), bookingController.updateSettings);
router.patch("/admin/:id/reschedule", requireAuth, requireRole("Admin"), bookingController.rescheduleBooking);
router.patch("/admin/:id/cancel", requireAuth, requireRole("Admin"), bookingController.cancelBooking);
router.put(
  "/admin/settings",
  requireAuth,
  requireRole("Admin"),
  bookingController.updateSettings
);
router.patch(
  "/admin/:id/reschedule",
  requireAuth,
  requireRole("Admin"),
  bookingController.rescheduleBooking
);
router.patch(
  "/admin/:id/cancel",
  requireAuth,
  requireRole("Admin"),
  bookingController.cancelBooking
);

module.exports = router;
