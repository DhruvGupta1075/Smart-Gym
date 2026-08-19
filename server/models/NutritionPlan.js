const mongoose = require('mongoose');

const mealItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  portion: { type: String, default: '1 serving' },
  calories: { type: Number, default: 0 },
  protein: { type: Number, default: 0 },
  carbs: { type: Number, default: 0 },
  fats: { type: Number, default: 0 },
});

const mealSchema = new mongoose.Schema({
  mealType: {
    type: String,
    enum: ['Breakfast', 'Morning Snack', 'Lunch', 'Pre-Workout', 'Post-Workout / Dinner', 'Evening Snack'],
    required: true,
  },
  time: { type: String, default: '08:00 AM' },
  items: [mealItemSchema],
  notes: { type: String, default: '' },
});

const nutritionPlanSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a nutrition plan title'],
      trim: true,
    },
    goal: {
      type: String,
      enum: ['Lean Bulk / Muscle Gain', 'Caloric Deficit / Fat Shred', 'Maintenance & Energy', 'Keto / Low Carb', 'Athletic Performance'],
      default: 'Lean Bulk / Muscle Gain',
    },
    targetCalories: {
      type: Number,
      required: true,
      default: 2400,
    },
    targetMacros: {
      proteinGrams: { type: Number, default: 160 },
      carbsGrams: { type: Number, default: 250 },
      fatsGrams: { type: Number, default: 65 },
    },
    waterLitersPerDay: {
      type: Number,
      default: 3.5,
    },
    trainer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    isTemplate: {
      type: Boolean,
      default: false,
    },
    meals: [mealSchema],
    guidelines: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('NutritionPlan', nutritionPlanSchema);
