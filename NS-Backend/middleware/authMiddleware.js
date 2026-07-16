const jwt = require("jsonwebtoken");
const User = require("../models/user");

const DEMO_USER_ID = "64b000000000000000000001";

async function getUserFromRequest(req) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";

  if (!token) {
    return null;
  }

  if (token === "demo-token" && process.env.NODE_ENV !== "production") {
    return {
      _id: DEMO_USER_ID,
      id: DEMO_USER_ID,
      name: "Demo User",
      email: "developer@varlexa.ai",
      role: "Developer",
    };
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
  // FALLBACK CHECK: Match both decoded.userId and decoded.id
  const userIdToFind = decoded.userId || decoded.id;

  if (!userIdToFind) {
    return null;
  }

  return User.findById(userIdToFind).select(
    "name email role avatar phone companyName address website linkedin bio preferredTechnologies"
  );
}

async function requireAuth(req, res, next) {
  try {
    const user = await getUserFromRequest(req);

    if (!user) {
      return res.status(401).json({ success: false, message: "Authentication required." });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid or expired token." });
  }
}
function requireRole(...roles) {
  const allowedRoles = roles.map((role) => String(role || "").toLowerCase());

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const userRole = String(req.user.role || "").toLowerCase();
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "Access denied.",
      });
    }

    next();
  };
}

module.exports = { requireAuth, requireRole };