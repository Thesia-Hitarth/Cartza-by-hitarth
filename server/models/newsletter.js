const Mongoose = require('mongoose');
const { Schema } = Mongoose;

// Newsletter Schema
const NewsletterSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  created: {
    type: Date,
    default: Date.now
  }
});

module.exports = Mongoose.model('Newsletter', NewsletterSchema);
