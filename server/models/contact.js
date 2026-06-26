const Mongoose = require('mongoose');
const { Schema } = Mongoose;

// Contact Schema
const ContactSchema = new Schema({
  name: {
    type: String,
    trim: true,
    maxlength: [100, 'Name must be 100 characters or fewer']
  },
  email: {
    type: String,
    maxlength: [254, 'Email must be 254 characters or fewer']
  },
  message: {
    type: String,
    trim: true,
    maxlength: [3000, 'Message must be 3000 characters or fewer']
  },
  reply: {
    type: String,
    trim: true,
    maxlength: [3000, 'Reply must be 3000 characters or fewer']
  },
  status: {
    type: String,
    default: 'Pending',
    enum: ['Pending', 'Resolved']
  },
  userRole: {
    type: String,
    default: 'Guest'
  },
  updated: Date,
  created: {
    type: Date,
    default: Date.now
  }
});

module.exports = Mongoose.model('Contact', ContactSchema);
