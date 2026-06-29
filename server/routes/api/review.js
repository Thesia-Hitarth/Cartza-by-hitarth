const express = require('express');
const router = express.Router();

// Bring in Models & Helpers
const Review = require('../../models/review');
const Product = require('../../models/product');
const auth = require('../../middleware/auth');
const role = require('../../middleware/role');
const { ROLES, REVIEW_STATUS } = require('../../constants');

const Order = require('../../models/order');
const Cart = require('../../models/cart');
const Mongoose = require('mongoose');

router.param('id', (req, res, next, id) => {
  if (!Mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid ID format.' });
  }
  next();
});

router.param('reviewId', (req, res, next, reviewId) => {
  if (!Mongoose.Types.ObjectId.isValid(reviewId)) {
    return res.status(400).json({ error: 'Invalid Review ID format.' });
  }
  next();
});

router.post('/add', auth, async (req, res) => {
  try {
    const user = req.user;
    const { product, title, rating, review, isRecommended } = req.body;

    if (!product) {
      return res.status(400).json({ error: 'Product is required.' });
    }

    const parsedRating = Number(rating);
    if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({ error: 'Rating must be a number between 1 and 5.' });
    }

    if (!review) {
      return res.status(400).json({ error: 'Review text is required.' });
    }

    // 1. Verify if user has purchased the product
    const orders = await Order.find({ user: user._id, status: { $ne: 'Cancelled' } }).populate('cart');
    const hasPurchased = orders.some(order => {
      if (order.cart && order.cart.products) {
        return order.cart.products.some(item => 
          String(item.product) === String(product) && 
          item.status !== 'Cancelled'
        );
      }
      return false;
    });

    if (!hasPurchased) {
      return res.status(400).json({ error: 'You can only review products you have purchased.' });
    }

    // 2. Prevent duplicate reviews
    const existingReview = await Review.findOne({ product, user: user._id });
    if (existingReview) {
      return res.status(400).json({ error: 'You have already submitted a review for this product.' });
    }

    const newReview = new Review({
      product,
      title,
      rating,
      review,
      isRecommended,
      user: user._id
    });

    const reviewDoc = await newReview.save();

    res.status(200).json({
      success: true,
      message: `Your review has been added successfully and will appear when approved!`,
      review: reviewDoc
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

// fetch all reviews api
router.get('/', auth, role.check(ROLES.Admin), async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const cappedLimit = Math.min(Number(limit) || 10, 100);

    const reviews = await Review.find()
      .sort('-created')
      .populate({
        path: 'user',
        select: 'firstName'
      })
      .populate({
        path: 'product',
        select: 'name slug imageUrl'
      })
      .limit(cappedLimit)
      .skip((page - 1) * cappedLimit)
      .exec();

    const count = await Review.countDocuments();

    res.status(200).json({
      reviews,
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

router.get('/:slug', async (req, res) => {
  try {
    const productDoc = await Product.findOne({ slug: req.params.slug });

    const hasNoBrand =
      productDoc?.brand === null || productDoc?.brand?.isActive === false;

    if (!productDoc || hasNoBrand) {
      return res.status(404).json({
        message: 'No product found.'
      });
    }

    const reviews = await Review.find({
      product: productDoc._id,
      status: REVIEW_STATUS.Approved
    })
      .populate({
        path: 'user',
        select: 'firstName'
      })
      .sort('-created');

    res.status(200).json({
      reviews
    });
  } catch (error) {
    res.status(500).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

router.put('/:id', auth, role.check(ROLES.Admin), async (req, res) => {
  try {
    const reviewId = req.params.id;
    const { title, rating: updateRating, review: updateReview, isRecommended, status } = req.body;
    const parsedUpdateRating = updateRating !== undefined ? Number(updateRating) : undefined;
    if (parsedUpdateRating !== undefined && (isNaN(parsedUpdateRating) || parsedUpdateRating < 1 || parsedUpdateRating > 5)) {
      return res.status(400).json({ error: 'Rating must be a number between 1 and 5.' });
    }
    const update = {};
    if (title !== undefined) update.title = title;
    if (parsedUpdateRating !== undefined) update.rating = parsedUpdateRating;
    if (updateReview !== undefined) update.review = updateReview;
    if (isRecommended !== undefined) update.isRecommended = isRecommended;
    if (status !== undefined) update.status = status;
    const query = { _id: reviewId };

    await Review.findOneAndUpdate(query, update, {
      new: true
    });

    res.status(200).json({
      success: true,
      message: 'Review has been updated successfully!'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

// approve review
router.put('/approve/:reviewId', auth, role.check(ROLES.Admin), async (req, res) => {
  try {
    const reviewId = req.params.reviewId;

    const query = { _id: reviewId };
    const update = {
      status: REVIEW_STATUS.Approved,
      isActive: true
    };

    await Review.findOneAndUpdate(query, update, {
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

// reject review
router.put('/reject/:reviewId', auth, role.check(ROLES.Admin), async (req, res) => {
  try {
    const reviewId = req.params.reviewId;

    const query = { _id: reviewId };
    const update = {
      status: REVIEW_STATUS.Rejected
    };

    await Review.findOneAndUpdate(query, update, {
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

router.delete('/delete/:id', auth, role.check(ROLES.Admin), async (req, res) => {
  try {
    const review = await Review.deleteOne({ _id: req.params.id });

    res.status(200).json({
      success: true,
      message: `Review has been deleted successfully!`,
      review
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

module.exports = router;
