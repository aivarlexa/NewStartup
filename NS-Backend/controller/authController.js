const User = require("../models/user");
const bcrypt = require("bcryptjs");
const generateToken = require("../config/token");
const { OAuth2Client } = require("google-auth-library");

const PUBLIC_ROLES = ["Client", "Developer"];

function getGoogleClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;

  if (!clientId) {
    return null;
  }

  return new OAuth2Client(clientId);
}

function normalizeUser(user) {
  return {
    id: user._id || user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar || "",
    phone: user.phone || "",
    companyName: user.companyName || "",
    address: user.address || "",
    website: user.website || "",
    linkedin: user.linkedin || "",
    bio: user.bio || "",
    preferredTechnologies: user.preferredTechnologies || [],
    settings: user.settings,
  };
}

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    if (!PUBLIC_ROLES.includes(role)) {
      return res.status(400).json({ success: false, message: "Please choose Client or Developer." });
    }

    if (String(password).length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters." });
    }

    const existingUser = await User.findOne({ email: String(email).trim().toLowerCase() });

    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      password: hashedPassword,
      role,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "Account created successfully.",
      token,
      user: normalizeUser(user),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const user = await User.findOne({ email: String(email || "").trim().toLowerCase() });

    if (!user || !user.password) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    const match = await bcrypt.compare(password || "", user.password);

    if (!match) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    if (role && user.role !== role) {
      return res.status(403).json({ success: false, message: `This account is registered as ${user.role}.` });
    }

    const token = generateToken(user._id);

    res.status(200).json({ success: true, token, user: normalizeUser(user) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      email: String(email).trim().toLowerCase(),
    });

    if (!user || !user.password) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // IMPORTANT: Match your stored role exactly
    if (user.role !== "Admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin account required.",
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Admin login successful.",
      token,
      user: normalizeUser(user),
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const forgotPassword = async (req, res) => {
  const { email, role } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required." });
  }

  const query = { email: String(email).trim().toLowerCase() };
  if (role) query.role = role;
  await User.findOne(query).lean();

  return res.json({
    success: true,
    message: "If an account exists, password reset instructions will be sent to that email.",
  });
};


const googleLogin = async (req, res) => {
  try {
    const client = getGoogleClient();

    if (!client) {
      return res.status(500).json({ success: false, message: "Google login is not configured." });
    }

    const { token, role = "Client" } = req.body;

    if (!PUBLIC_ROLES.includes(role)) {
      return res.status(400).json({ success: false, message: "Please choose Client or Developer." });
    }

    const ticket = await client.verifyIdToken({ idToken: token, audience: process.env.GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    const { name, email, picture } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({ name, email, role, google: true, avatar: picture });
    }

    if (user.role !== role) {
      return res.status(403).json({ success: false, message: `This account is registered as ${user.role}.` });
    }

    const jwt = generateToken(user._id);

    res.json({ success: true, token: jwt, user: normalizeUser(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Google Login Failed" });
  }
};

module.exports = { register, login,adminLogin, forgotPassword, googleLogin };
