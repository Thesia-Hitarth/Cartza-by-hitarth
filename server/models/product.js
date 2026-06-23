const Mongoose = require('mongoose');
const { Schema } = Mongoose;
const { generateUniqueSlug } = require('../utils/slugify');

// Product Schema
const ProductSchema = new Schema({
  sku: {
    type: String
  },
  name: {
    type: String,
    trim: true
  },
  slug: {
    type: String,
    unique: true
  },
  imageUrl: {
    type: String
  },
  imageKey: {
    type: String
  },
  description: {
    type: String,
    trim: true
  },
  quantity: {
    type: Number
  },
  price: {
    type: Number
  },
  compareAtPrice: {
    type: Number,
    default: null
  },
  taxable: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  brand: {
    type: Schema.Types.ObjectId,
    ref: 'Brand',
    default: null
  },
  colors: {
    type: [String],
    default: []
  },
  sizes: {
    type: [String],
    default: []
  },
  updated: Date,
  created: {
    type: Date,
    default: Date.now
  }
});

ProductSchema.pre('save', async function (next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = await generateUniqueSlug(this.constructor, this.name, this._id);
  }
  next();
});

module.exports = Mongoose.model('Product', ProductSchema);
