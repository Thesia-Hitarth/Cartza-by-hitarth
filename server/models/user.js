const Mongoose = require('mongoose');

const { ROLES, EMAIL_PROVIDER } = require('../constants');

const { Schema } = Mongoose;

// User Schema
const UserSchema = new Schema({
  email: {
    type: String,
    required: function () {
      return this.provider === EMAIL_PROVIDER.Email;
    },
    unique: true,
    index: true,
    maxlength: [254, 'Email must be 254 characters or fewer']
  },
  phoneNumber: {
    type: String,
    maxlength: [20, 'Phone number must be 20 characters or fewer']
  },
  firstName: {
    type: String,
    maxlength: [50, 'First name must be 50 characters or fewer']
  },
  lastName: {
    type: String,
    maxlength: [50, 'Last name must be 50 characters or fewer']
  },
  password: {
    type: String,
    select: false
  },
  merchant: {
    type: Schema.Types.ObjectId,
    ref: 'Merchant',
    default: null
  },
  provider: {
    type: String,
    required: true,
    default: EMAIL_PROVIDER.Email
  },
  googleId: {
    type: String
  },
  avatar: {
    type: String
  },
  role: {
    type: String,
    default: ROLES.Member,
    enum: [ROLES.Admin, ROLES.Member, ROLES.Merchant]
  },
  jwtSeed: {
    type: Number,
    default: 1
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: { type: String, select: false },
  emailVerificationExpires: { type: Date, select: false },
  resetPasswordToken: { type: String, select: false },
  resetPasswordExpires: { type: Date, select: false },
  updated: Date,
  created: {
    type: Date,
    default: Date.now
  }
});

module.exports = Mongoose.model('User', UserSchema);
