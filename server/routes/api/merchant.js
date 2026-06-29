const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Bring in Models & Helpers
const { MERCHANT_STATUS, ROLES } = require('../../constants');
const Merchant = require('../../models/merchant');
const User = require('../../models/user');
const Brand = require('../../models/brand');
const auth = require('../../middleware/auth');
const role = require('../../middleware/role');
const smtp = require('../../services/smtp');
const keys = require('../../config/keys');
const Product = require('../../models/product');
const store = require('../../utils/store');
const Mongoose = require('mongoose');

router.param('id', (req, res, next, id) => {
  if (!Mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid merchant ID format.' });
  }
  next();
});

// add merchant api
router.post('/add', async (req, res) => {
  try {
    const { name, business, phoneNumber, email, brandName } = req.body;

    if (!name || !email) {
      return res
        .status(400)
        .json({ error: 'You must enter your name and email.' });
    }

    if (!business) {
      return res
        .status(400)
        .json({ error: 'You must enter a business description.' });
    }

    if (!phoneNumber || !email) {
      return res
        .status(400)
        .json({ error: 'You must enter a phone number and an email address.' });
    }

    const existingMerchant = await Merchant.findOne({ email });

    if (existingMerchant) {
      return res
        .status(400)
        .json({ error: 'That email address is already in use.' });
    }

    const merchant = new Merchant({
      name,
      email,
      business,
      phoneNumber,
      brandName
    });
    const merchantDoc = await merchant.save();

    try {
      await smtp.sendEmail(email, 'merchant-application');
    } catch (emailError) {
      console.warn('Merchant application notification email failed to send:', emailError.message);
    }

    res.status(200).json({
      success: true,
      message: `We received your request! We will contact you at ${phoneNumber}.`,
      merchant: merchantDoc
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

// search merchants api
router.get('/search', auth, role.check(ROLES.Admin), async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const cappedLimit = Math.min(Number(limit) || 10, 100);

    const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapeRegExp(search || ''), 'i');
    const query = {
      $or: [
        { phoneNumber: { $regex: regex } },
        { email: { $regex: regex } },
        { name: { $regex: regex } },
        { brandName: { $regex: regex } },
        { status: { $regex: regex } }
      ]
    };

    const merchants = await Merchant.find(query)
      .populate('brand', 'name')
      .limit(cappedLimit)
      .skip((page - 1) * cappedLimit)
      .exec();

    const count = await Merchant.countDocuments(query);

    res.status(200).json({
      merchants,
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

// fetch all merchants api
router.get('/', auth, role.check(ROLES.Admin), async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const cappedLimit = Math.min(Number(limit) || 10, 100);

    const merchants = await Merchant.find()
      .populate('brand')
      .sort('-created')
      .limit(cappedLimit)
      .skip((page - 1) * cappedLimit)
      .exec();

    const count = await Merchant.countDocuments();

    res.status(200).json({
      merchants,
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

// disable merchant account
router.put('/:id/active', auth, role.check(ROLES.Admin), async (req, res) => {
  try {
    const merchantId = req.params.id;
    const update = req.body.merchant;
    const query = { _id: merchantId };

    const merchantDoc = await Merchant.findOneAndUpdate(query, update, {
      new: true
    });

    if (!update.isActive) {
      await deactivateBrand(merchantId);
      await User.findOneAndUpdate({ merchant: merchantId }, { role: ROLES.Member });
      try {
        await smtp.sendEmail(merchantDoc.email, 'merchant-deactivate-account');
      } catch (emailError) {
        console.warn('Merchant deactivation email failed to send:', emailError.message);
      }
    }

    res.status(200).json({
      success: true
    });
  } catch (error) {
    res.status(500).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

// approve merchant
router.put('/approve/:id', auth, role.check(ROLES.Admin), async (req, res) => {
  try {
    const merchantId = req.params.id;
    const query = { _id: merchantId };
    const update = {
      status: MERCHANT_STATUS.Approved,
      isActive: true
    };

    const merchantDoc = await Merchant.findOneAndUpdate(query, update, {
      new: true
    });

    await createMerchantUser(
      merchantDoc.email,
      merchantDoc.name,
      merchantId,
      keys.app.clientURL
    );

    res.status(200).json({
      success: true
    });
  } catch (error) {
    res.status(400).json({
      error: error.message || 'Your request could not be processed. Please try again.'
    });
  }
});

// reject merchant
router.put('/reject/:id', auth, role.check(ROLES.Admin), async (req, res) => {
  try {
    const merchantId = req.params.id;

    const query = { _id: merchantId };
    const update = {
      status: MERCHANT_STATUS.Rejected
    };

    await Merchant.findOneAndUpdate(query, update, {
      new: true
    });

    res.status(200).json({
      success: true
    });
  } catch (error) {
    res.status(500).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

router.post('/signup/:token', async (req, res) => {
  try {
    const { email, firstName, lastName, password } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ error: 'You must enter an email address.' });
    }

    if (!firstName || !lastName) {
      return res.status(400).json({ error: 'You must enter your full name.' });
    }

    if (!password) {
      return res.status(400).json({ error: 'You must enter a password.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    }
    if (!/[a-zA-Z]/.test(password) || !/[0-9!@#$%^&*]/.test(password)) {
      return res.status(400).json({ error: 'Password must contain at least one letter and one number or special character.' });
    }

    const tokenHash = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const userDoc = await User.findOne({
      email,
      resetPasswordToken: tokenHash,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!userDoc) {
      return res.status(400).json({ error: 'Invalid or expired signup token.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const query = { _id: userDoc._id };
    const update = {
      email,
      firstName,
      lastName,
      password: hash,
      resetPasswordToken: undefined,
      $inc: { jwtSeed: 1 }
    };

    await User.findOneAndUpdate(query, update, {
      new: true
    });

    const merchantDoc = await Merchant.findOne({
      email
    });

    await createMerchantBrand(merchantDoc);

    res.status(200).json({
      success: true
    });
  } catch (error) {
    res.status(500).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

router.delete(
  '/delete/:id',
  auth,
  role.check(ROLES.Admin),
  async (req, res) => {
    try {
      const merchantId = req.params.id;
      await deactivateBrand(merchantId);
      await User.findOneAndUpdate({ merchant: merchantId }, { role: ROLES.Member, merchant: null });
      const merchant = await Merchant.deleteOne({ _id: merchantId });

      res.status(200).json({
        success: true,
        message: `Merchant has been deleted successfully!`,
        merchant
      });
    } catch (error) {
      res.status(400).json({
        error: 'Your request could not be processed. Please try again.'
      });
    }
  }
);

const deactivateBrand = async merchantId => {
  const merchantDoc = await Merchant.findOne({ _id: merchantId }).populate(
    'brand',
    '_id'
  );
  if (!merchantDoc || !merchantDoc.brand) return;
  const brandId = merchantDoc.brand._id;
  const query = { _id: brandId };
  const update = {
    isActive: false
  };

  const products = await Product.find({ brand: brandId });
  await store.disableProducts(products);

  await User.findOneAndUpdate({ merchant: merchantId }, { role: ROLES.Member });

  return await Brand.findOneAndUpdate(query, update, {
    new: true
  });
};

const createMerchantBrand = async ({ _id, brandName, business }) => {
  const existingBrand = await Brand.findOne({ merchant: _id });
  if (existingBrand) return;

  const newBrand = new Brand({
    name: brandName,
    description: business,
    merchant: _id,
    isActive: true
  });

  const brandDoc = await newBrand.save();

  const update = {
    brand: brandDoc._id
  };
  await Merchant.findOneAndUpdate({ _id }, update);
};

const createMerchantUser = async (email, name, merchant, host) => {
  const firstName = name;
  const lastName = '';

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    if (existingUser.role === ROLES.Admin) {
      throw new Error('Cannot convert an Admin account to a Merchant.');
    }
    const query = { _id: existingUser._id };
    const update = {
      merchant,
      role: ROLES.Merchant
    };

    const merchantDoc = await Merchant.findOne({
      email
    });

    await createMerchantBrand(merchantDoc);

    try {
      await smtp.sendEmail(email, 'merchant-welcome', null, name);
    } catch (emailError) {
      console.warn('Merchant welcome email failed to send:', emailError.message);
    }

    return await User.findOneAndUpdate(query, update, {
      new: true
    });
  } else {
    const buffer = await crypto.randomBytes(48);
    const resetToken = buffer.toString('hex');

    const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetPasswordExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    const user = new User({
      email,
      firstName,
      lastName: null,
      resetPasswordToken,
      resetPasswordExpires,
      merchant,
      role: ROLES.Merchant
    });

    await smtp.sendEmail(email, 'merchant-signup', host, {
      resetToken,
      email
    });

    return await user.save();
  }
};

module.exports = router;
