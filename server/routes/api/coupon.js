const express = require('express');
const router = express.Router();
const Coupon = require('../../models/coupon');
const auth = require('../../middleware/auth');
const role = require('../../middleware/role');
const { ROLES } = require('../../constants');

// Validate coupon route
router.post('/validate', auth, async (req, res) => {
  try {
    const { code, orderTotal } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Coupon code is required.' });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    if (!coupon) {
      return res.status(404).json({ error: 'Invalid or expired coupon code.' });
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return res.status(400).json({ error: 'This coupon has expired.' });
    }

    if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
      return res.status(400).json({ error: 'This coupon has reached its maximum usage limit.' });
    }

    const parsedTotal = Number(orderTotal) || 0;
    if (parsedTotal < coupon.minOrderValue) {
      return res.status(400).json({
        error: `Minimum order value of ₹${coupon.minOrderValue} is required to use this coupon.`
      });
    }

    let discount = 0;
    if (coupon.type === 'percentage') {
      discount = (parsedTotal * coupon.value) / 100;
    } else if (coupon.type === 'fixed') {
      discount = coupon.value;
    }

    // Ensure discount is not greater than order total
    discount = Math.min(discount, parsedTotal);

    res.status(200).json({
      success: true,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      discount: parseFloat(discount.toFixed(2))
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Admin add coupon
router.post('/add', auth, role.check(ROLES.Admin), async (req, res) => {
  try {
    const { code, type, value, minOrderValue, maxUses, expiresAt } = req.body;

    if (!code || !type || value === undefined) {
      return res.status(400).json({ error: 'Missing required fields: code, type, value' });
    }

    const existing = await Coupon.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(400).json({ error: 'A coupon with this code already exists.' });
    }

    const coupon = new Coupon({
      code: code.toUpperCase(),
      type,
      value,
      minOrderValue: minOrderValue || 0,
      maxUses: maxUses !== undefined ? maxUses : null,
      expiresAt: expiresAt || null,
      createdBy: req.user._id
    });

    await coupon.save();
    res.status(200).json({ success: true, message: 'Coupon created successfully!', coupon });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Admin list all coupons
router.get('/', auth, role.check(ROLES.Admin), async (req, res) => {
  try {
    const coupons = await Coupon.find().sort('-created');
    res.status(200).json({ coupons });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Admin edit coupon
router.put('/:id', auth, role.check(ROLES.Admin), async (req, res) => {
  try {
    const { code, type, value, minOrderValue, maxUses, expiresAt, isActive } = req.body;
    const update = {};

    if (code) update.code = code.toUpperCase();
    if (type) update.type = type;
    if (value !== undefined) update.value = value;
    if (minOrderValue !== undefined) update.minOrderValue = minOrderValue;
    if (maxUses !== undefined) update.maxUses = maxUses;
    if (expiresAt !== undefined) update.expiresAt = expiresAt;
    if (isActive !== undefined) update.isActive = isActive;

    const coupon = await Coupon.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!coupon) {
      return res.status(404).json({ error: 'Coupon not found.' });
    }

    res.status(200).json({ success: true, message: 'Coupon updated successfully!', coupon });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Admin delete/deactivate coupon
router.delete('/:id', auth, role.check(ROLES.Admin), async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!coupon) {
      return res.status(404).json({ error: 'Coupon not found.' });
    }
    res.status(200).json({ success: true, message: 'Coupon deactivated successfully!' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
