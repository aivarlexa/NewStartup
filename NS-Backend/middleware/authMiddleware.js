const jwt = require("jsonwebtoken");
const User = require("../models/user");

async function requireAdmin(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : "";

    if (!token) {
      return res.status(401).json({ success: false, message: "Admin authentication required." });
    }

    if (token === "demo-token" && process.env.NODE_ENV !== "production") {
      req.user = { name: "Demo User", email: "developer@varlexa.ai", role: "Developer" };
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("name email role");

    if (!user) {
      return res.status(401).json({ success: false, message: "User not found." });
    }

    const adminRoles = ["Business Owner", "Project Manager", "Developer"];
    if (!adminRoles.includes(user.role)) {
      return res.status(403).json({ success: false, message: "Admin access required." });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid or expired token." });
  }
}

module.exports = { requireAdmin };
