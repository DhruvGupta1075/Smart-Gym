const mongoose = require('mongoose');

const progressLogSchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: String, // 'YYYY-MM-DD'
      required: true,
    },
    weightKg: {
      type: Number,
      required: true,
    },
    bodyFatPercentage: {
      type: Number,
      default: 0,
    },
    measurements: {
      chestCm: { type: Number, default: 0 },
      waistCm: { type: Number, default: 0 },
      hipsCm: { type: Number, default: 0 },
      armsCm: { type: Number, default: 0 },
      thighsCm: { type: Number, default: 0 },
      shouldersCm: { type: Number, default: 0 },
    },
    benchPressMaxKg: {
      type: Number,
      default: 0,
    },
    squatMaxKg: {
      type: Number,
      default: 0,
    },
    deadliftMaxKg: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      default: '',
    },
    energyLevel: {
      type: Number,
      min: 1,
      max: 10,
      default: 8,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ProgressLog', progressLogSchema);
