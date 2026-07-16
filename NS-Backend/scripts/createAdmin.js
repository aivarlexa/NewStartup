require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Change these paths according to your project
const User = require("../models/user");

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB Connected");
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

async function createAdmin() {
  try {
    await connectDB();

    const existingAdmin = await User.findOne({
      email: "admin@varlexa.ai",
    });

    if (existingAdmin) {
      console.log("Admin already exists.");
      process.exit();
    }

    const hashedPassword = await bcrypt.hash("Admin@123", 10);

    const admin = new User({
      name: "Varlexa Admin",
      email: "admin@varlexa.ai",
      password: hashedPassword,
      role: "Admin",
    });

    await admin.save();

    console.log("Admin created successfully.");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

createAdmin();