const cron = require('node-cron');
const Cart = require('../models/cart');
const User = require('../models/user');
const smtp = require('../services/smtp');
const keys = require('../config/keys');

const runAbandonedCartJob = () => {
  // Run every hour
  cron.schedule('0 * * * *', async () => {
    try {
      console.log('Running abandoned cart recovery job...');
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      
      const carts = await Cart.find({
        products: { $exists: true, $not: { $size: 0 } },
        updated: { $lt: oneHourAgo },
        recoveryEmailSentAt: null
      }).populate('user');

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
          } catch (emailError) {
            console.error(`Failed to send recovery email to ${cart.user.email}:`, emailError.message);
          }
        }
      }
    } catch (error) {
      console.error('Error in abandoned cart recovery job:', error);
    }
  });
};

module.exports = runAbandonedCartJob;
