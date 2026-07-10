const Mongoose = require('mongoose');
const { Schema } = Mongoose;

const PendingPaymentSchema = new Schema({
  razorpayOrderId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  cartId: {
    type: Schema.Types.ObjectId,
    ref: 'Cart',
    required: true
  },
  addressId: {
    type: Schema.Types.ObjectId,
    ref: 'Address',
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  discount: {
    type: Number,
    default: 0
  },
  couponCode: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'error'],
    default: 'pending'
  },
  error: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 7200 // 2 hours TTL
  }
});

module.exports = Mongoose.model('PendingPayment', PendingPaymentSchema);
