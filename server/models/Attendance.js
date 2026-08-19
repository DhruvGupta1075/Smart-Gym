const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: String, // 'YYYY-MM-DD' formatted for reliable day indexing
      required: true,
    },
    checkInTime: {
      type: Date,
      default: Date.now,
    },
    checkOutTime: {
      type: Date,
      default: null,
    },
    method: {
      type: String,
      enum: ['QR_SCAN', 'MANUAL_CODE', 'ADMIN_OVERRIDE'],
      default: 'QR_SCAN',
    },
    status: {
      type: String,
      enum: ['Present', 'Late', 'Excused'],
      default: 'Present',
    },
    qrSessionId: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Prevent duplicate attendance for the same member on the same date
attendanceSchema.index({ member: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
