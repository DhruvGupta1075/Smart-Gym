const mongoose = require('mongoose');

const whitelistSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Please provide an email to whitelist'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['admin', 'trainer'],
      required: [true, 'Please specify the allowed role for this email'],
    },
    notes: {
      type: String,
      default: 'Authorized personnel',
    },
    addedBy: {
      type: String,
      default: 'System Superadmin',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Whitelist', whitelistSchema);
