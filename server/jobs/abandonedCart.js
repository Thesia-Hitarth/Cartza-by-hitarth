const cron = require('node-cron');
const Cart = require('../models/cart');
const User = require('../models/user');
const smtp = require('../services/smtp');
const keys = require('../config/keys');

const processAbandonedCarts = async () => {
  console.log('Running abandoned cart recovery job...');
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  
  const carts = await Cart.find({
    products: { $exists: true, $not: { $size: 0 } },
    updated: { $lt: oneHourAgo },
    recoveryEmailSentAt: null
  }).populate([
    { path: 'user' },
    { path: 'products.product', select: 'name imageUrl price slug' }
  ]);

  let sentCount = 0;
  for (const cart of carts) {
    if (cart.user && cart.user.email) {
      try {
        await smtp.sendEmail(
          cart.user.email,
          'abandoned-cart',
          keys.app.clientURL,
          cart
        );
        cart.recoveryEmailSentAt = new Date();
        await cart.save();
        console.log(`Abandoned cart recovery email sent to ${cart.user.email}`);
        sentCount++;
      } catch (emailError) {
        console.error(`Failed to send recovery email to ${cart.user.email}:`, emailError.message);
      }
    }
  }
  return sentCount;
};

const runAbandonedCartJob = () => {
  // Run every day at 9:00 AM UTC (equivalent to 2:30 PM IST)
  cron.schedule('0 9 * * *', async () => {
    try {
      await processAbandonedCarts();
    } catch (error) {
      console.error('Error in abandoned cart recovery job:', error);
    }
  });
};

module.exports = {
  processAbandonedCarts,
  runAbandonedCartJob
};
