const axios = require('axios');

/**
 * Initiates an order with the Razorpay API.
 * @param {string} cartId
 * @param {number} amountInRupees
 * @returns {Promise<string>} The Razorpay Gateway Order ID
 */
const createRazorpayOrder = async (cartId, amountInRupees) => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error('Razorpay credentials not configured.');
  }

  const authHeader = Buffer.from(`${keyId}:${keySecret}`).toString('base64');

  const response = await axios.post(
    'https://api.razorpay.com/v1/orders',
    {
      amount: Math.round(amountInRupees * 100), // convert to paisa
      currency: 'INR',
      receipt: `receipt_${cartId}`
    },
    {
      headers: {
        Authorization: `Basic ${authHeader}`
      }
    }
  );

  return response.data.id;
};

module.exports = {
  createRazorpayOrder
};
