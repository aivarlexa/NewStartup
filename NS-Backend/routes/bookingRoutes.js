const express = require("express");
const router = express.Router();
const { requireAdmin } = require("../middleware/authMiddleware");
const bookingController = require("../controller/bookingController");

router.get("/settings", bookingController.getSettings);
router.get("/slots", bookingController.getAvailableSlots);
router.post("/", bookingController.createBooking);
router.get("/google/auth-url", requireAdmin, bookingController.googleAuthUrl);
router.get("/google/callback", bookingController.googleCallback);

router.get("/admin", requireAdmin, bookingController.listBookings);
router.put("/admin/settings", requireAdmin, bookingController.updateSettings);
router.patch("/admin/:id/reschedule", requireAdmin, bookingController.rescheduleBooking);
router.patch("/admin/:id/cancel", requireAdmin, bookingController.cancelBooking);

module.exports = router;
