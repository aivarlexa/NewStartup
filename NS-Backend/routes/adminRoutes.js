const express = require("express");

const router = express.Router();

const {
  requireAuth,
  requireRole,
} = require("../middleware/authMiddleware");

const {
  getDashboard,
} = require("../controller/adminController");

router.get(
  "/dashboard",
  requireAuth,
  requireRole("Admin"),
  getDashboard
);

module.exports = router;