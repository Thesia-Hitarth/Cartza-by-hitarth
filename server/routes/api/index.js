const router = require('express').Router();

const authRoutes = require('./auth');
const userRoutes = require('./user');
const addressRoutes = require('./address');
const newsletterRoutes = require('./newsletter');
const productRoutes = require('./product');
const categoryRoutes = require('./category');
const brandRoutes = require('./brand');
const contactRoutes = require('./contact');
const merchantRoutes = require('./merchant');
const cartRoutes = require('./cart');
const orderRoutes = require('./order');
const reviewRoutes = require('./review');
const wishlistRoutes = require('./wishlist');
const webhookRoutes = require('./webhook');
const couponRoutes = require('./coupon');
const analyticsRoutes = require('./analytics');
const jobRoutes = require('./job');

// auth routes
router.use('/auth', authRoutes);

// user routes
router.use('/user', userRoutes);

// address routes
router.use('/address', addressRoutes);

// newsletter routes
router.use('/newsletter', newsletterRoutes);

// product routes
router.use('/product', productRoutes);

// category routes
router.use('/category', categoryRoutes);

// brand routes
router.use('/brand', brandRoutes);

// contact routes
router.use('/contact', contactRoutes);

// merchant routes
router.use('/merchant', merchantRoutes);

// cart routes
router.use('/cart', cartRoutes);

// order routes
router.use('/order', orderRoutes);

// Review routes
router.use('/review', reviewRoutes);

// Wishlist routes
router.use('/wishlist', wishlistRoutes);

// Webhook routes
router.use('/webhook', webhookRoutes);

// Coupon routes
router.use('/coupon', couponRoutes);

// Analytics routes
router.use('/analytics', analyticsRoutes);

// Jobs routes
router.use('/jobs', jobRoutes);

// Dynamic robots.txt route
router.get('/robots', (req, res) => {
  res.type('text/plain');
  if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== 'production') {
    res.send('User-agent: *\nDisallow: /');
  } else {
    res.send('User-agent: *\nAllow: /\nDisallow: /dashboard/\nDisallow: /api/\nSitemap: https://cartza-by-hitarth.vercel.app/sitemap.xml');
  }
});

module.exports = router;
