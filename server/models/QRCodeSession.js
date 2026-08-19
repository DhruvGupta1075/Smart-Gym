const mongoose = require('mongoose');

const qrCodeSessionSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
    },
    date: {
      type: String, // 'YYYY-MM-DD'
      required: true,
    },
    codeString: {
      type: String,
      required: true,
    },
    qrDataUrl: {
      type: String,
      default: '',
    },
    active: {
      type: Boolean,
      default: true,
    },
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    location: {
      type: String,
      default: 'Main Gym Floor - Entrance Gate',
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('QRCodeSession', qrCodeSessionSchema);
