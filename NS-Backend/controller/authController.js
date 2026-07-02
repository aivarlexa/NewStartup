const User = require("../models/user");
const bcrypt = require("bcryptjs");
const generateToken = require("../config/token");
const { OAuth2Client } = require("google-auth-library");

function getGoogleClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;

  if (!clientId) {
    return null;
  }

  return new OAuth2Client(clientId);
}
const register = async (req, res) => {
  console.log("Request Body:", req.body);

  try {
    const { name, email, password, role } = req.body;

    console.log({
      name,
      email,
      password,
      role,
    });

    if (!name || !email || !password || !role) {
      console.log("Missing Fields");

      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    const existingUser = await User.findOne({ email });

    console.log("Existing User:", existingUser);

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists.",
      });
    }

    // rest of your code...
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "Account created successfully.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
const googleLogin = async (req, res) => {

    try {

    const client = getGoogleClient();

    if (!client) {
      return res.status(500).json({
        success: false,
        message: "Google login is not configured.",
      });
    }

        const { token } = req.body;

        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();

        const {
            name,
            email,
            picture,
        } = payload;

        let user = await User.findOne({ email });

        if (!user) {

            user = await User.create({
                name,
                email,
                role: "Client",
                google: true,
                avatar: picture,
            });

        }

        const jwt = generateToken(user._id);

        res.json({
            success: true,
            token: jwt,
            user,
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: "Google Login Failed",
        });

    }

};

module.exports = {
  register,
  login,
  googleLogin
};