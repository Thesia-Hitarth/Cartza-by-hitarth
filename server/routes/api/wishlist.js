const express = require('express');
const router = express.Router();

// Bring in Models & Helpers
const Wishlist = require('../../models/wishlist');
const auth = require('../../middleware/auth');

router.post('/', auth, async (req, res) => {
  try {
    const { product } = req.body;
    const user = req.user;

    const existingWishlist = await Wishlist.findOne({ product, user: user._id });

    if (existingWishlist) {
      existingWishlist.isLiked = !existingWishlist.isLiked;
      existingWishlist.updated = Date.now();
      const updatedWishlist = await existingWishlist.save();

      res.status(200).json({
        success: true,
        message: existingWishlist.isLiked ? 'Added to your Wishlist successfully!' : 'Removed from your Wishlist successfully!',
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
