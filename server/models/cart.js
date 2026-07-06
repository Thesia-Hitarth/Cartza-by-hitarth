const Mongoose = require('mongoose');

const { CART_ITEM_STATUS } = require('../constants');

const { Schema } = Mongoose;

// Cart Item Schema
const CartItemSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product'
  },
  quantity: Number,
  color: {
    type: String,
    default: 'Default'
  },
  size: {
    type: String,
    default: 'Default'
  },
  purchasePrice: {
    type: Number,
    default: 0
  },
  totalPrice: {
    type: Number,
    default: 0
  },
  priceWithTax: {
    type: Number,
    default: 0
  },
  totalTax: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    default: CART_ITEM_STATUS.Not_processed,
    enum: [
      CART_ITEM_STATUS.Not_processed,
      CART_ITEM_STATUS.Processing,
      CART_ITEM_STATUS.Shipped,
      CART_ITEM_STATUS.Delivered,
      CART_ITEM_STATUS.Cancelled
    ]
  }
});

Mongoose.model('CartItem', CartItemSchema);

// Cart Schema
const CartSchema = new Schema({
  products: [CartItemSchema],
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  updated: Date,
  created: {
    type: Date,
    default: Date.now
  },
  recoveryEmailSentAt: {
    type: Date,
    default: null
  }
});

module.exports = Mongoose.model('Cart', CartSchema);
