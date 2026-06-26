const Mongoose = require('mongoose');
const { Schema } = Mongoose;

// Order Schema
const OrderSchema = new Schema({
  cart: {
    type: Schema.Types.ObjectId,
    ref: 'Cart'
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  address: {
    type: Schema.Types.ObjectId,
    ref: 'Address'
  },
  total: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    default: 'Not_processed',
    enum: ['Not_processed', 'Processing', 'Shipped', 'Delivered', 'Cancelled']
  },
  isCancelled: {
    type: Boolean,
    default: false
  },
  updated: Date,
  created: {
    type: Date,
    default: Date.now
  }
});

module.exports = Mongoose.model('Order', OrderSchema);
