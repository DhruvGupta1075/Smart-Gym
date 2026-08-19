require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env"),
});
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const QRCode = require("qrcode");
const User = require("../models/User");
const Whitelist = require("../models/Whitelist");
const Attendance = require("../models/Attendance");
const WorkoutPlan = require("../models/WorkoutPlan");
const NutritionPlan = require("../models/NutritionPlan");
const ProgressLog = require("../models/ProgressLog");
const QRCodeSession = require("../models/QRCodeSession");
const { connectDB, disconnectDB } = require("../config/db");

const seedData = async () => {
  try {
    console.log("[Seed] Starting database seeding process...");

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

    // 1. Whitelist pre-approved emails
    const whitelistedEmails = [
      {
        email: "admin@smartgym.com",
        role: "admin",
        notes: "Master Superadmin Account",
      },
      {
        email: "trainer.alex@smartgym.com",
        role: "trainer",
        notes: "Head Strength Coach",
      },
      {
        email: "trainer.sarah@smartgym.com",
        role: "trainer",
        notes: "Elite Nutritionist & Hypertrophy Specialist",
      },
      {
        email: "trainer.mike@smartgym.com",
        role: "trainer",
        notes: "Functional Movement Coach",
      },
    ];
    await Whitelist.insertMany(whitelistedEmails);
    console.log("[Seed] Inserted Whitelist records.");

    // 2. Create Users
    // Admin
    const admin = await User.create({
      name: "Marcus Vance",
      email: "admin@smartgym.com",
      password: "mygympass123",
      role: "admin",
      phone: "+1 (555) 019-2831",
      isWhitelisted: true,
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    });

    // Trainers
    const trainerAlex = await User.create({
      name: "Alex Rivera, CSCS",
      email: "trainer.alex@smartgym.com",
      password: "Trainer@12345",
      role: "trainer",
      phone: "+1 (555) 234-5678",
      isWhitelisted: true,
      avatar:
        "https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=150&auto=format&fit=crop&q=80",
      trainerDetails: {
        specialization: "Powerlifting, Strength & Hypertrophy",
        experienceYears: 7,
        bio: "Former competitive powerlifter and certified strength conditioning specialist.",
      },
    });

    const trainerSarah = await User.create({
      name: "Sarah Chen, MS, CPT",
      email: "trainer.sarah@smartgym.com",
      password: "Trainer@12345",
      role: "trainer",
      phone: "+1 (555) 876-5432",
      isWhitelisted: true,
      avatar:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      trainerDetails: {
        specialization: "Body Recomposition & Sports Nutrition",
        experienceYears: 5,
        bio: "Clinical nutritionist and physique transformation coach specializing in metabolic health.",
      },
    });

    // Members
    const membersData = [
      {
        name: "Jordan Miller",
        email: "jordan.member@gmail.com",
        password: "Member@12345",
        role: "member",
        phone: "+1 (555) 345-9871",
        avatar:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
        membership: {
          planName: "Platinum Annual",
          status: "Active",
          startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
          expiryDate: new Date(Date.now() + 275 * 24 * 60 * 60 * 1000),
          price: 399,
        },
        assignedTrainer: trainerAlex._id,
        fitnessGoals: "Increase deadlift to 200kg and build lean muscle mass",
        streakDays: 14,
      },
      {
        name: "Elena Rostova",
        email: "elena.member@gmail.com",
        password: "Member@12345",
        role: "member",
        phone: "+1 (555) 456-1122",
        avatar:
          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
        membership: {
          planName: "Gold Half-Yearly",
          status: "Active",
          startDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
          expiryDate: new Date(Date.now() + 135 * 24 * 60 * 60 * 1000),
          price: 229,
        },
        assignedTrainer: trainerSarah._id,
        fitnessGoals:
          "Fat loss (-6kg), tone core and glutes, run a sub-25 min 5k",
        streakDays: 8,
      },
      {
        name: "Devon Knight",
        email: "devon.member@gmail.com",
        password: "Member@12345",
        role: "member",
        phone: "+1 (555) 789-3344",
        avatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        membership: {
          planName: "VIP Elite",
          status: "Active",
          startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
          expiryDate: new Date(Date.now() + 305 * 24 * 60 * 60 * 1000),
          price: 599,
        },
        assignedTrainer: trainerAlex._id,
        fitnessGoals:
          "Athletic conditioning, high-intensity intervals, and mobility",
        streakDays: 5,
      },
      {
        name: "Chloe Bennett",
        email: "chloe.member@gmail.com",
        password: "Member@12345",
        role: "member",
        phone: "+1 (555) 901-4455",
        avatar:
          "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
        membership: {
          planName: "Silver Quarterly",
          status: "Active",
          startDate: new Date(Date.now() - 85 * 24 * 60 * 60 * 1000),
          expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // Expiring soon!
          price: 129,
        },
        assignedTrainer: trainerSarah._id,
        fitnessGoals:
          "Postural correction, shoulder rehabilitation, and core stability",
        streakDays: 3,
      },
      {
        name: "Liam Vance",
        email: "liam.member@gmail.com",
        password: "Member@12345",
        role: "member",
        phone: "+1 (555) 612-8899",
        avatar:
          "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
        membership: {
          planName: "Basic Monthly",
          status: "Expired",
          startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
          expiryDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // Expired!
          price: 49,
        },
        assignedTrainer: null,
        fitnessGoals: "Cardio endurance and general health maintenance",
        streakDays: 0,
      },
    ];

    const createdMembers = await User.create(membersData);
    console.log(`[Seed] Created ${createdMembers.length} demo members.`);

    // 3. Create Daily QR Code Session for Self Check-In
    const today = new Date().toISOString().split("T")[0];
    const qrToken = `SMARTGYM-${today}-X79K92`;
    const qrPayload = JSON.stringify({
      gym: "Smart Gym Analytics Platform",
      token: qrToken,
      date: today,
      location: "Main Gym Floor - Gate A",
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });

    const qrDataUrl = await QRCode.toDataURL(qrPayload, {
      width: 400,
      margin: 2,
      color: {
        dark: "#06B6D4",
        light: "#0B0F19",
      },
    });

    await QRCodeSession.create({
      token: qrToken,
      date: today,
      codeString: qrPayload,
      qrDataUrl,
      active: true,
      generatedBy: admin._id,
      location: "Main Gym Floor - Gate A",
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
    console.log("[Seed] Created active Daily QR Code Session.");

    // 4. Generate 14 days of realistic attendance history
    const attendanceRecords = [];
    const jordan = createdMembers[0];
    const elena = createdMembers[1];
    const devon = createdMembers[2];
    const chloe = createdMembers[3];

    for (let i = 14; i >= 1; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const isWeekend = d.getDay() === 0 || d.getDay() === 6;

      // Jordan attends 5-6 days a week
      if (d.getDay() !== 0) {
        const checkInTime = new Date(d);
        checkInTime.setHours(7, Math.floor(Math.random() * 45), 0);
        attendanceRecords.push({
          member: jordan._id,
          date: dateStr,
          checkInTime,
          method: "QR_SCAN",
          status: "Present",
          qrSessionId: `SMARTGYM-${dateStr}`,
          notes: "Early morning hypertrophy workout",
        });
      }

      // Elena attends 4 days a week
      if ([1, 3, 4, 6].includes(d.getDay())) {
        const checkInTime = new Date(d);
        checkInTime.setHours(17, Math.floor(Math.random() * 50), 0);
        attendanceRecords.push({
          member: elena._id,
          date: dateStr,
          checkInTime,
          method: "QR_SCAN",
          status: "Present",
          qrSessionId: `SMARTGYM-${dateStr}`,
          notes: "Evening HIIT and glute focus",
        });
      }

      // Devon attends 4 days a week
      if ([2, 4, 5, 6].includes(d.getDay())) {
        const checkInTime = new Date(d);
        checkInTime.setHours(18, Math.floor(Math.random() * 40), 0);
        attendanceRecords.push({
          member: devon._id,
          date: dateStr,
          checkInTime,
          method: "QR_SCAN",
          status: "Present",
          qrSessionId: `SMARTGYM-${dateStr}`,
          notes: "Powerlifting session",
        });
      }

      // Chloe attends 3 days a week
      if ([1, 3, 5].includes(d.getDay())) {
        const checkInTime = new Date(d);
        checkInTime.setHours(12, Math.floor(Math.random() * 30), 0);
        attendanceRecords.push({
          member: chloe._id,
          date: dateStr,
          checkInTime,
          method: "QR_SCAN",
          status: "Present",
          qrSessionId: `SMARTGYM-${dateStr}`,
          notes: "Lunchtime mobility workout",
        });
      }
    }

    // Insert today's check-ins for Jordan and Elena
    const todayJordanTime = new Date();
    todayJordanTime.setHours(7, 15, 0);
    attendanceRecords.push({
      member: jordan._id,
      date: today,
      checkInTime: todayJordanTime,
      method: "QR_SCAN",
      status: "Present",
      qrSessionId: qrToken,
      notes: "Checked in at Gate A",
    });

    await Attendance.insertMany(attendanceRecords);
    console.log(
      `[Seed] Created ${attendanceRecords.length} realistic attendance records.`,
    );

    // 5. Create Workout Plan for Jordan (Assigned by Alex)
    await WorkoutPlan.create({
      title: "Hypertrophy & Strength Split (PPL + Upper/Lower)",
      description:
        "Progressive overload program focused on compound lifts and muscle hypertrophy.",
      goal: "Hypertrophy / Muscle Building",
      difficulty: "Intermediate",
      trainer: trainerAlex._id,
      member: jordan._id,
      isTemplate: false,
      schedule: [
        {
          day: "Monday",
          title: "Heavy Push (Chest / Delts / Triceps)",
          focusArea: "Chest & Shoulders",
          exercises: [
            {
              name: "Barbell Flat Bench Press",
              targetMuscle: "Chest",
              sets: 4,
              reps: "6-8",
              restSeconds: 90,
              instructions: "Pause 1s at bottom, explosive concentric drive",
              completed: true,
            },
            {
              name: "Incline Dumbbell Press",
              targetMuscle: "Upper Chest",
              sets: 3,
              reps: "8-10",
              restSeconds: 75,
              instructions: "30-degree bench angle",
              completed: true,
            },
            {
              name: "Standing Overhead Barbell Press",
              targetMuscle: "Deltoids",
              sets: 4,
              reps: "6-8",
              restSeconds: 90,
              instructions: "Brace core tightly",
              completed: false,
            },
            {
              name: "Cable Lateral Raises",
              targetMuscle: "Lateral Deltoids",
              sets: 4,
              reps: "12-15",
              restSeconds: 60,
              instructions: "Lean slightly away from stack",
              completed: false,
            },
            {
              name: "Overhead Tricep Rope Extension",
              targetMuscle: "Triceps",
              sets: 3,
              reps: "10-12",
              restSeconds: 60,
              instructions: "Flare elbows out at peak",
              completed: false,
            },
          ],
        },
        {
          day: "Tuesday",
          title: "Heavy Pull (Lats / Upper Back / Biceps)",
          focusArea: "Back & Biceps",
          exercises: [
            {
              name: "Conventional Deadlift",
              targetMuscle: "Posterior Chain",
              sets: 4,
              reps: "5",
              restSeconds: 120,
              instructions: "Reset each rep from the floor",
              completed: false,
            },
            {
              name: "Weighted Pull-ups",
              targetMuscle: "Lats",
              sets: 3,
              reps: "6-8",
              restSeconds: 90,
              instructions: "Full range of motion dead-hang",
              completed: false,
            },
            {
              name: "Chest-Supported T-Bar Row",
              targetMuscle: "Mid-Back",
              sets: 3,
              reps: "8-10",
              restSeconds: 75,
              instructions: "Squeeze shoulder blades",
              completed: false,
            },
            {
              name: "Incline Dumbbell Hammer Curls",
              targetMuscle: "Brachialis & Biceps",
              sets: 3,
              reps: "10-12",
              restSeconds: 60,
              instructions: "Strict form, no swinging",
              completed: false,
            },
          ],
        },
        {
          day: "Wednesday",
          title: "Legs & Core Hypertrophy",
          focusArea: "Quads & Hamstrings",
          exercises: [
            {
              name: "Barbell High-Bar Back Squat",
              targetMuscle: "Quadriceps",
              sets: 4,
              reps: "6-8",
              restSeconds: 120,
              instructions: "Hit parallel or deeper",
              completed: false,
            },
            {
              name: "Romanian Deadlift (RDL)",
              targetMuscle: "Hamstrings",
              sets: 3,
              reps: "8-10",
              restSeconds: 90,
              instructions: "Hinge hips backwards",
              completed: false,
            },
            {
              name: "Bulgarian Split Squats",
              targetMuscle: "Quads & Glutes",
              sets: 3,
              reps: "10 each",
              restSeconds: 75,
              instructions: "Control descent 3 seconds",
              completed: false,
            },
            {
              name: "Hanging Leg Raises",
              targetMuscle: "Lower Abs",
              sets: 4,
              reps: "15",
              restSeconds: 60,
              instructions: "Avoid swinging",
              completed: false,
            },
          ],
        },
        {
          day: "Thursday",
          title: "Active Recovery / Cardio & Mobility",
          focusArea: "Cardio & Joint Health",
          exercises: [
            {
              name: "Zone 2 Incline Treadmill Walk",
              targetMuscle: "Cardio",
              sets: 1,
              reps: "30 mins",
              restSeconds: 0,
              instructions: "12% incline, 4.5 km/h",
              completed: false,
            },
            {
              name: "Foam Rolling & Hip Mobility Drill",
              targetMuscle: "Mobility",
              sets: 1,
              reps: "15 mins",
              restSeconds: 0,
              instructions: "Couch stretch, 90/90s",
              completed: false,
            },
          ],
        },
        {
          day: "Friday",
          title: "Upper Body Pump & Density",
          focusArea: "Upper Body",
          exercises: [
            {
              name: "Weighted Dips",
              targetMuscle: "Chest & Triceps",
              sets: 3,
              reps: "8-10",
              restSeconds: 75,
              instructions: "Slight forward lean",
              completed: false,
            },
            {
              name: "Seated Cable Row",
              targetMuscle: "Lats",
              sets: 4,
              reps: "10-12",
              restSeconds: 60,
              instructions: "V-bar attachment",
              completed: false,
            },
            {
              name: "Dumbbell Incline Lateral Raises",
              targetMuscle: "Shoulders",
              sets: 4,
              reps: "15",
              restSeconds: 45,
              instructions: "High volume pump",
              completed: false,
            },
            {
              name: "EZ Bar Preacher Curls",
              targetMuscle: "Biceps",
              sets: 3,
              reps: "10-12",
              restSeconds: 60,
              instructions: "Slow negative",
              completed: false,
            },
          ],
        },
        {
          day: "Saturday",
          title: "Lower Body & Explosive Power",
          focusArea: "Legs & Calves",
          exercises: [
            {
              name: "Leg Press (45 Degree)",
              targetMuscle: "Quads",
              sets: 4,
              reps: "10-12",
              restSeconds: 90,
              instructions: "Feet low on platform",
              completed: false,
            },
            {
              name: "Lying Hamstring Leg Curl",
              targetMuscle: "Hamstrings",
              sets: 4,
              reps: "12",
              restSeconds: 60,
              instructions: "Hold contraction 1 sec",
              completed: false,
            },
            {
              name: "Standing Calf Raises",
              targetMuscle: "Calves",
              sets: 5,
              reps: "15",
              restSeconds: 45,
              instructions: "Deep stretch at bottom",
              completed: false,
            },
          ],
        },
        {
          day: "Sunday",
          title: "Complete Rest & Growth",
          focusArea: "Recovery",
          exercises: [
            {
              name: "Hydration & Nutrition Optimization",
              targetMuscle: "Mindset",
              sets: 1,
              reps: "All Day",
              restSeconds: 0,
              instructions: "Hit 3.5L water and 180g protein",
              completed: false,
            },
          ],
        },
      ],
    });

    // 6. Create Nutrition Plan for Jordan (Assigned by Alex)
    await NutritionPlan.create({
      title: "Lean Bulking 2800 kcal Fuel Plan",
      goal: "Lean Bulk / Muscle Gain",
      targetCalories: 2800,
      targetMacros: {
        proteinGrams: 190,
        carbsGrams: 330,
        fatsGrams: 75,
      },
      waterLitersPerDay: 3.8,
      trainer: trainerAlex._id,
      member: jordan._id,
      isTemplate: false,
      guidelines: [
        "Consume 30-40g protein with each main meal",
        "Take 5g Creatine Monohydrate post-workout with carbohydrate source",
        "Maintain 3.5+ liters of water daily for glycogen storage and kidney support",
        "Stop caffeine intake 7 hours before bedtime to maximize growth hormone release",
      ],
      meals: [
        {
          mealType: "Breakfast",
          time: "07:30 AM",
          notes: "High complex carbs and lean protein for morning fuel",
          items: [
            {
              name: "Rolled Oats with Almond Milk",
              portion: "100g oats + 200ml milk",
              calories: 420,
              protein: 14,
              carbs: 70,
              fats: 8,
            },
            {
              name: "Whey Isolate Protein Scoop",
              portion: "1 scoop (30g)",
              calories: 120,
              protein: 26,
              carbs: 2,
              fats: 1,
            },
            {
              name: "Blueberries & Walnuts",
              portion: "50g berries + 15g nuts",
              calories: 150,
              protein: 3,
              carbs: 12,
              fats: 10,
            },
            {
              name: "Whole Eggs (Boiled/Scrambled)",
              portion: "2 whole eggs",
              calories: 140,
              protein: 12,
              carbs: 1,
              fats: 10,
            },
          ],
        },
        {
          mealType: "Morning Snack",
          time: "10:45 AM",
          notes: "Sustained energy release",
          items: [
            {
              name: "Greek Yogurt 0% Fat",
              portion: "200g",
              calories: 130,
              protein: 20,
              carbs: 8,
              fats: 0,
            },
            {
              name: "Banana with Honey",
              portion: "1 medium",
              calories: 110,
              protein: 1,
              carbs: 28,
              fats: 0,
            },
          ],
        },
        {
          mealType: "Lunch",
          time: "01:15 PM",
          notes: "Pre-load glycogen for evening session",
          items: [
            {
              name: "Grilled Chicken Breast",
              portion: "200g cooked",
              calories: 330,
              protein: 62,
              carbs: 0,
              fats: 6,
            },
            {
              name: "Jasmine White Rice",
              portion: "220g cooked",
              calories: 280,
              protein: 5,
              carbs: 62,
              fats: 1,
            },
            {
              name: "Steamed Broccoli & Olive Oil",
              portion: "150g broccoli + 10ml oil",
              calories: 140,
              protein: 4,
              carbs: 8,
              fats: 10,
            },
          ],
        },
        {
          mealType: "Pre-Workout",
          time: "04:30 PM",
          notes: "Fast digesting carbs 45 mins before training",
          items: [
            {
              name: "Rice Cakes with Peanut Butter",
              portion: "3 cakes + 20g PB",
              calories: 230,
              protein: 7,
              carbs: 26,
              fats: 11,
            },
          ],
        },
        {
          mealType: "Post-Workout / Dinner",
          time: "07:30 PM",
          notes: "Anabolic recovery window",
          items: [
            {
              name: "Lean Sirloin Beef or Salmon",
              portion: "200g",
              calories: 380,
              protein: 45,
              carbs: 0,
              fats: 18,
            },
            {
              name: "Baked Sweet Potato",
              portion: "250g",
              calories: 220,
              protein: 4,
              carbs: 50,
              fats: 0,
            },
            {
              name: "Mixed Leaf Salad & Balsamic",
              portion: "1 big bowl",
              calories: 60,
              protein: 2,
              carbs: 8,
              fats: 2,
            },
          ],
        },
      ],
    });

    // 7. Create Progress History for Jordan (Past 6 weeks)
    const progressLogsJordan = [
      {
        member: jordan._id,
        date: new Date(Date.now() - 42 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        weightKg: 84.5,
        bodyFatPercentage: 18.2,
        measurements: {
          chestCm: 102,
          waistCm: 86,
          hipsCm: 99,
          armsCm: 37.0,
          thighsCm: 59,
          shouldersCm: 118,
        },
        benchPressMaxKg: 95,
        squatMaxKg: 130,
        deadliftMaxKg: 165,
        notes: "Starting baseline measurement block.",
        energyLevel: 7,
      },
      {
        member: jordan._id,
        date: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        weightKg: 83.9,
        bodyFatPercentage: 17.4,
        measurements: {
          chestCm: 103,
          waistCm: 84.5,
          hipsCm: 98.5,
          armsCm: 37.5,
          thighsCm: 59.5,
          shouldersCm: 119,
        },
        benchPressMaxKg: 100,
        squatMaxKg: 135,
        deadliftMaxKg: 175,
        notes: "Bench press hit triple digits! Waist dropped 1.5cm.",
        energyLevel: 8,
      },
      {
        member: jordan._id,
        date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        weightKg: 83.4,
        bodyFatPercentage: 16.5,
        measurements: {
          chestCm: 104,
          waistCm: 83.0,
          hipsCm: 98,
          armsCm: 38.2,
          thighsCm: 60.5,
          shouldersCm: 120.5,
        },
        benchPressMaxKg: 102.5,
        squatMaxKg: 142.5,
        deadliftMaxKg: 185,
        notes: "Shoulders widening and arms crossed 38cm cold.",
        energyLevel: 9,
      },
      {
        member: jordan._id,
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        weightKg: 82.8,
        bodyFatPercentage: 15.6,
        measurements: {
          chestCm: 105.5,
          waistCm: 81.5,
          hipsCm: 97.5,
          armsCm: 39.0,
          thighsCm: 61.5,
          shouldersCm: 122,
        },
        benchPressMaxKg: 107.5,
        squatMaxKg: 150,
        deadliftMaxKg: 195,
        notes: "Body recomposition peak: down in fat, up in all major lifts!",
        energyLevel: 9,
      },
    ];

    // Progress for Elena
    const progressLogsElena = [
      {
        member: elena._id,
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        weightKg: 64.2,
        bodyFatPercentage: 24.5,
        measurements: {
          chestCm: 88,
          waistCm: 72,
          hipsCm: 96,
          armsCm: 27,
          thighsCm: 55,
          shouldersCm: 98,
        },
        benchPressMaxKg: 40,
        squatMaxKg: 65,
        deadliftMaxKg: 80,
        notes: "First check with Sarah.",
        energyLevel: 7,
      },
      {
        member: elena._id,
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        weightKg: 61.5,
        bodyFatPercentage: 21.8,
        measurements: {
          chestCm: 87,
          waistCm: 67.5,
          hipsCm: 94,
          armsCm: 26.5,
          thighsCm: 53.5,
          shouldersCm: 99,
        },
        benchPressMaxKg: 47.5,
        squatMaxKg: 75,
        deadliftMaxKg: 95,
        notes: "Waist down nearly 5cm! Glute strength significantly improved.",
        energyLevel: 9,
      },
    ];

    await ProgressLog.insertMany([...progressLogsJordan, ...progressLogsElena]);
    console.log("[Seed] Created detailed multi-week progress logs.");

    console.log("[Seed] Database seeding completed successfully! ✨");
  } catch (error) {
    console.error("[Seed Error]:", error);
    throw error;
  }
};

// Run directly if invoked from CLI
if (require.main === module) {
  connectDB().then(async () => {
    await seedData();
    await disconnectDB();
    process.exit(0);
  });
}

module.exports = seedData;
