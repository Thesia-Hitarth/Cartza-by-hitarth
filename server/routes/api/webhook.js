const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const PendingPayment = require('../../models/pendingPayment');
const Order = require('../../models/order');
const { createOrder } = require('../../services/order');

router.post('/razorpay', async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];

    if (!webhookSecret || !signature) {
      return res.status(400).json({ error: 'Webhook secret or signature missing.' });
    }

    // Verify signature using the raw body captured on req.rawBody
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(req.rawBody || '')
      .digest('hex');

    if (expectedSignature !== signature) {
      console.warn('[WEBHOOK WARNING] Razorpay webhook signature verification failed.');
      return res.status(400).json({ error: 'Invalid signature.' });
    }

    const event = req.body;
    if (event && event.event === 'payment.captured') {
      const paymentEntity = event.payload?.payment?.entity;
      if (!paymentEntity) {
        return res.status(400).json({ error: 'Invalid webhook payload.' });
      }

      const gatewayOrderId = paymentEntity.order_id;
      const paymentId = paymentEntity.id;

      if (gatewayOrderId) {
        // Find the pending checkout session metadata
        const pending = await PendingPayment.findOne({ razorpayOrderId: gatewayOrderId });
        if (pending) {
          // Check if order has already been created (Fast path client POST may have already done it)
          const existingOrder = await Order.findOne({ cart: pending.cartId, user: pending.userId });
          if (!existingOrder) {
            console.log(`[WEBHOOK] Reconciling payment for order ${gatewayOrderId}. Creating order...`);
            try {
              await createOrder({
                cartId: pending.cartId,
                addressId: pending.addressId,
                userId: pending.userId
              });
              // Clean up pending payment record
              await pending.deleteOne();
            } catch (err) {
              console.error(`[WEBHOOK ERROR] Stock allocation / order creation failed for captured payment. Order ${gatewayOrderId}:`, err.message);
              pending.status = 'error';
              pending.error = err.message;
              await pending.save();
            }
          } else {
            console.log(`[WEBHOOK] Order already exists for order ${gatewayOrderId}. Skipping...`);
          }
        }
      }
    }

    res.status(200).json({ status: 'success' });
  } catch (error) {
    console.error('[WEBHOOK ERROR] Razorpay webhook failed:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
