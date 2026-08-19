const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  targetMuscle: { type: String, default: 'Full Body' },
  sets: { type: Number, default: 3 },
  reps: { type: String, default: '10-12' },
  restSeconds: { type: Number, default: 60 },
  videoUrl: { type: String, default: '' },
  instructions: { type: String, default: '' },
  completed: { type: Boolean, default: false },
});

const dayRoutineSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true,
  },
  title: { type: String, default: 'Rest / Cardio' },
  focusArea: { type: String, default: 'Active Recovery' },
  exercises: [exerciseSchema],
});

const workoutPlanSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a workout plan title'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    goal: {
      type: String,
      enum: ['Hypertrophy / Muscle Building', 'Fat Loss & Conditioning', 'Strength & Power', 'Endurance & Stamina', 'Mobility & Posture'],
      default: 'Hypertrophy / Muscle Building',
    },
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Athlete'],
      default: 'Intermediate',
    },
    trainer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // Null means it's a reusable master template
    },
    isTemplate: {
      type: Boolean,
      default: false,
    },
    schedule: [dayRoutineSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('WorkoutPlan', workoutPlanSchema);
