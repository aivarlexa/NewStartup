const express = require("express");
const { register, login,adminLogin, forgotPassword, googleLogin } = require("../controller/authController");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/admin/login", adminLogin);
router.post("/forgot-password", forgotPassword);
router.post("/google", googleLogin);

module.exports = router;
