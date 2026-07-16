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

router.get(
  "/admin",
  requireAuth,
  requireRole("Admin"),
  bookingController.listBookings
);
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
