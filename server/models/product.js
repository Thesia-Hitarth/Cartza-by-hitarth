const Mongoose = require('mongoose');
const { Schema } = Mongoose;
const { generateUniqueSlug } = require('../utils/slugify');

// Product Schema
const ProductSchema = new Schema({
  sku: {
    type: String,
    maxlength: [100, 'SKU must be 100 characters or fewer']
  },
  name: {
    type: String,
    trim: true,
    maxlength: [200, 'Product name must be 200 characters or fewer']
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
  images: [{
    url: String,
    key: String
  }],
  description: {
    type: String,
    trim: true,
    maxlength: [5000, 'Description must be 5000 characters or fewer']
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
  variants: [{
    color: { type: String, default: 'Default' },
    size: { type: String, default: 'Default' },
    quantity: { type: Number, default: 0 },
    sku: { type: String }
  }],
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

ProductSchema.index({ brand: 1, isActive: 1 });
ProductSchema.index({ sku: 1 });
ProductSchema.index({ name: 'text' });

module.exports = Mongoose.model('Product', ProductSchema);
