require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env"),
});
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Whitelist = require("../models/Whitelist");
const Attendance = require("../models/Attendance");
const WorkoutPlan = require("../models/WorkoutPlan");
const NutritionPlan = require("../models/NutritionPlan");
const ProgressLog = require("../models/ProgressLog");
const QRCodeSession = require("../models/QRCodeSession");
const { connectDB, disconnectDB } = require("../config/db");

const seedData = async (isStandalone = false) => {
  try {
    if (isStandalone) await connectDB();
    console.log("[Seed] Starting database bootstrapping process...");

    // Clear existing collections
    await Promise.all([
      User.deleteMany({}),
      Whitelist.deleteMany({}),
      Attendance.deleteMany({}),
      WorkoutPlan.deleteMany({}),
      NutritionPlan.deleteMany({}),
      ProgressLog.deleteMany({}),
      QRCodeSession.deleteMany({}),
    ]);
    console.log("[Seed] Cleared existing data.");

    // 1. Whitelist pre-approved admin email
    const whitelistedEmails = [
      {
        email: "admin@smartgym.com",
        role: "admin",
        notes: "Master Superadmin Account",
      }
    ];
    await Whitelist.insertMany(whitelistedEmails);
    console.log("[Seed] Inserted Whitelist records.");

    // 2. Create Master Admin User
    const admin = await User.create({
      name: "Dhruv",
      email: "admin@smartgym.com",
      password: "mygympass123",
      role: "admin",
      phone: "+1 (555) 019-2831",
      isWhitelisted: true,
      avatar:
        ""
    });
    console.log("[Seed] Created Master Admin Account.");

    console.log("[Seed] Database bootstrapping completed successfully! ✨");
    if (isStandalone) {
      await disconnectDB();
      process.exit(0);
    }
  } catch (error) {
    console.error("[Seed] Seeding failed:", error);
    if (isStandalone) {
      await disconnectDB();
      process.exit(1);
    } else {
      throw error;
    }
  }
};

if (require.main === module) {
  seedData(true);
}

module.exports = seedData;
