const Mongoose = require('mongoose');

const { REVIEW_STATUS } = require('../constants');

const { Schema } = Mongoose;

// Review Schema
const ReviewSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    default: null,
    index: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true
  },
  title: {
    type: String,
    trim: true,
    maxlength: [150, 'Review title must be 150 characters or fewer']
  },
  rating: {
    type: Number,
    default: 0,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating must be 5 or less']
  },
  review: {
    type: String,
    trim: true,
    maxlength: [2000, 'Review must be 2000 characters or fewer']
  },
  isRecommended: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    default: REVIEW_STATUS.Waiting_Approval,
    enum: [
      REVIEW_STATUS.Waiting_Approval,
      REVIEW_STATUS.Rejected,
      REVIEW_STATUS.Approved
    ]
  },
  updated: Date,
  created: {
    type: Date,
    default: Date.now
  }
});

module.exports = Mongoose.model('Review', ReviewSchema);
