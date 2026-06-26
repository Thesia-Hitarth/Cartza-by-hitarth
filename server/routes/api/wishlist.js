const express = require('express');
const router = express.Router();

// Bring in Models & Helpers
const Wishlist = require('../../models/wishlist');
const auth = require('../../middleware/auth');
const rateLimiter = require('../../middleware/rateLimiter');

const wishlistLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: 'Too many wishlist requests, please try again later.'
});

// The $bit XOR trick is not available for boolean fields; instead we use a
// conditional $set with a compare-and-swap pattern via findOneAndUpdate.
router.post('/', auth, wishlistLimiter, async (req, res) => {
  try {
    const { product } = req.body;
    const user = req.user;

    // Atomically find the existing doc and toggle isLiked
    const existingWishlist = await Wishlist.findOne({ product, user: user._id });

    if (existingWishlist) {
      const updatedWishlist = await Wishlist.findOneAndUpdate(
        { _id: existingWishlist._id, isLiked: existingWishlist.isLiked },
        { $set: { isLiked: !existingWishlist.isLiked, updated: Date.now() } },
        { new: true }
      );

      if (!updatedWishlist) {
        // Another concurrent request changed the state; re-fetch and return current
        const current = await Wishlist.findById(existingWishlist._id);
        return res.status(200).json({
          success: true,
          message: current.isLiked ? 'Added to your Wishlist successfully!' : 'Removed from your Wishlist successfully!',
          wishlist: current
        });
      }

      res.status(200).json({
        success: true,
        message: updatedWishlist.isLiked ? 'Added to your Wishlist successfully!' : 'Removed from your Wishlist successfully!',
        wishlist: updatedWishlist
      });
    } else {
      const wishlist = new Wishlist({
        product,
        isLiked: true,
        user: user._id
      });

      const wishlistDoc = await wishlist.save();

      res.status(200).json({
        success: true,
        message: `Added to your Wishlist successfully!`,
        wishlist: wishlistDoc
      });
    }
  } catch (e) {
    return res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

// fetch wishlist api
router.get('/', auth, async (req, res) => {
  try {
    const user = req.user._id;

    const wishlist = await Wishlist.find({ user, isLiked: true })
      .populate({
        path: 'product',
        select: 'name slug price imageUrl'
      })
      .sort('-updated');

    res.status(200).json({
      wishlist
    });
  } catch (error) {
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

module.exports = router;
