const express = require('express');
const router = express.Router();

// Bring in Models & Helpers
const User = require('../../models/user');
const auth = require('../../middleware/auth');
const role = require('../../middleware/role');
const { ROLES } = require('../../constants');
const validator = require('validator');

// search users api
router.get('/search', auth, role.check(ROLES.Admin), async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const cappedLimit = Math.min(Number(limit) || 10, 100);

    const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapeRegExp(search || ''), 'i');

    const query = {
      $or: [
        { firstName: { $regex: regex } },
        { lastName: { $regex: regex } },
        { email: { $regex: regex } }
      ]
    };

    const users = await User.find(query, { password: 0, _id: 0 })
      .populate('merchant', 'name')
      .limit(cappedLimit)
      .skip((page - 1) * cappedLimit)
      .exec();

    const count = await User.countDocuments(query);

    res.status(200).json({
      users,
      totalPages: Math.ceil(count / cappedLimit),
      currentPage: Number(page),
      count
    });
  } catch (error) {
    res.status(500).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

// fetch users api
router.get('/', auth, role.check(ROLES.Admin), async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const users = await User.find({}, { password: 0, _id: 0, googleId: 0 })
      .sort('-created')
      .populate('merchant', 'name')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await User.countDocuments();

    res.status(200).json({
      users,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      count
    });
  } catch (error) {
    res.status(500).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

router.get('/me', auth, async (req, res) => {
  try {
    const user = req.user._id;
    const userDoc = await User.findById(user, { password: 0 }).populate({
      path: 'merchant',
      model: 'Merchant',
      populate: {
        path: 'brand',
        model: 'Brand'
      }
    });

    res.status(200).json({
      user: userDoc
    });
  } catch (error) {
    res.status(500).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

router.put('/', auth, async (req, res) => {
  try {
    const user = req.user._id;
    const { firstName, lastName, phoneNumber } = req.body.profile || {};

    if (firstName !== undefined) {
      if (typeof firstName !== 'string' || firstName.trim().length === 0) {
        return res.status(400).json({ error: 'First name cannot be empty.' });
      }
      if (firstName.trim().length > 50) {
        return res.status(400).json({ error: 'First name must be 50 characters or fewer.' });
      }
    }
    if (lastName !== undefined) {
      if (typeof lastName !== 'string' || lastName.trim().length === 0) {
        return res.status(400).json({ error: 'Last name cannot be empty.' });
      }
      if (lastName.trim().length > 50) {
        return res.status(400).json({ error: 'Last name must be 50 characters or fewer.' });
      }
    }
    if (phoneNumber !== undefined && phoneNumber !== '') {
      const cleanPhone = String(phoneNumber).trim();
      // Basic phone validation: 7-15 digits with optional leading +
      if (!/^\+?[0-9]{7,15}$/.test(cleanPhone)) {
        return res.status(400).json({ error: 'Please enter a valid phone number.' });
      }
    }

    const update = {};
    if (firstName !== undefined) update.firstName = firstName.trim();
    if (lastName !== undefined) update.lastName = lastName.trim();
    if (phoneNumber !== undefined) update.phoneNumber = String(phoneNumber).trim();

    const query = { _id: user };
    const userDoc = await User.findOneAndUpdate(query, update, {
      new: true
    });

    res.status(200).json({
      success: true,
      message: 'Your profile is successfully updated!',
      user: userDoc
    });
  } catch (error) {
    res.status(500).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

router.delete('/me', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    // Anonymize rather than hard-delete to preserve order history integrity
    await User.findByIdAndUpdate(userId, {
      firstName: 'Deleted',
      lastName: 'User',
      email: `deleted_${userId}@deleted.invalid`,
      password: undefined,
      googleId: undefined,
      phoneNumber: undefined,
      resetPasswordToken: undefined,
      resetPasswordExpires: undefined
    });
    res.status(200).json({
      success: true,
      message: 'Your account has been successfully deleted.'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

module.exports = router;
