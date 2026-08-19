const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['admin', 'trainer', 'member'],
      default: 'member',
    },
    phone: {
      type: String,
      default: '',
    },
    avatar: {
      type: String,
      default: '',
    },
    isWhitelisted: {
      type: Boolean,
      default: false,
    },
    // Member specific fields
    membership: {
      planName: {
        type: String,
        enum: ['None', 'Basic Monthly', 'Silver Quarterly', 'Gold Half-Yearly', 'Platinum Annual', 'VIP Elite'],
        default: 'Basic Monthly',
      },
      status: {
        type: String,
        enum: ['Active', 'Pending', 'Expired', 'Frozen'],
        default: 'Active',
      },
      startDate: {
        type: Date,
        default: Date.now,
      },
      expiryDate: {
        type: Date,
        default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      price: {
        type: Number,
        default: 49,
      },
    },
    assignedTrainer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    // Trainer specific fields
    trainerDetails: {
      specialization: {
        type: String,
        default: 'General Fitness & Strength Conditioning',
      },
      experienceYears: {
        type: Number,
        default: 3,
      },
      bio: {
        type: String,
        default: 'Certified strength & conditioning coach passionate about transforming physiques and athletic performance.',
      },
    },
    fitnessGoals: {
      type: String,
      default: 'Muscle building and fat reduction',
    },
    streakDays: {
      type: Number,
      default: 0,
    },
    lastCheckIn: {
      type: Date,
      default: null,
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
