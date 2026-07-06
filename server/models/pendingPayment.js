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
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 7200 // 2 hours TTL
  }
});

module.exports = Mongoose.model('PendingPayment', PendingPaymentSchema);
