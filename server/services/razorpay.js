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

/**
 * Creates or retrieves a Customer ID from Razorpay.
 * @param {object} user - User document
 * @returns {Promise<string|null>} The Razorpay Customer ID
 */
const getOrCreateRazorpayCustomer = async (user) => {
  if (user.razorpayCustomerId) {
    return user.razorpayCustomerId;
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) return null;

  const authHeader = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
  try {
    const response = await axios.post(
      'https://api.razorpay.com/v1/customers',
      {
        name: `${user.firstName || 'User'} ${user.lastName || ''}`.trim(),
        email: user.email,
        fail_existing: 0
      },
      {
        headers: {
          Authorization: `Basic ${authHeader}`
        }
      }
    );
    const customerId = response.data.id;
    user.razorpayCustomerId = customerId;
    await user.save();
    return customerId;
  } catch (error) {
    console.error('Failed to create Razorpay customer:', error.response?.data || error.message);
    return null;
  }
};

module.exports = {
  createRazorpayOrder,
  getOrCreateRazorpayCustomer
};
