const express = require('express');
const router = express.Router();
const Mongoose = require('mongoose');

// Bring in Models & Utils
const Order = require('../../models/order');
const Cart = require('../../models/cart');
const Product = require('../../models/product');
const auth = require('../../middleware/auth');
const role = require('../../middleware/role');
const smtp = require('../../services/smtp');
const store = require('../../utils/store');
const { ROLES, CART_ITEM_STATUS } = require('../../constants');

router.param('orderId', (req, res, next, orderId) => {
  if (!Mongoose.Types.ObjectId.isValid(orderId)) {
    return res.status(400).json({ error: 'Invalid Order ID format.' });
  }
  next();
});

router.param('itemId', (req, res, next, itemId) => {
  if (!Mongoose.Types.ObjectId.isValid(itemId)) {
    return res.status(400).json({ error: 'Invalid Item ID format.' });
  }
  next();
});

router.post('/add', auth, async (req, res) => {
  try {
    const { cartId, addressId, paymentId, gatewayOrderId, signature } = req.body;
    const user = req.user._id;

    if (!addressId) {
      return res.status(400).json({ error: 'Please select a delivery address.' });
    }

    const Address = require('../../models/address');
    const addr = await Address.findOne({ _id: addressId, user });
    if (!addr) {
      return res.status(400).json({ error: 'Invalid address selected.' });
    }

    // Verify Payment Signature if Razorpay credentials are set in env
    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
      if (!paymentId || !gatewayOrderId || !signature) {
        return res.status(400).json({ error: 'Payment details are missing.' });
      }
      const crypto = require('crypto');
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(gatewayOrderId + '|' + paymentId)
        .digest('hex');
      if (expectedSignature !== signature) {
        return res.status(400).json({ error: 'Payment verification failed. Invalid signature.' });
      }
    }

    const cartDoc = await Cart.findById(cartId).populate({
      path: 'products.product',
      populate: {
        path: 'brand'
      }
    });

    if (!cartDoc || !cartDoc.products || cartDoc.products.length === 0) {
      return res.status(400).json({ error: 'Cannot place an order with an empty cart.' });
    }

    // Filter out items where product has been deleted (is null)
    const validProducts = cartDoc.products.filter(item => item.product !== null);
    if (validProducts.length === 0) {
      return res.status(400).json({ error: 'Cannot place an order with no valid products.' });
    }

    // Decrement stock atomically and verify success
    const decrementedProducts = [];
    try {
      for (const item of validProducts) {
        const productId = item.product._id || item.product;
        const updatedProduct = await Product.findOneAndUpdate(
          { _id: productId, quantity: { $gte: item.quantity } },
          { $inc: { quantity: -item.quantity } },
          { new: true }
        );
        if (!updatedProduct) {
          throw new Error(`Insufficient stock for product: ${item.product.name}`);
        }
        decrementedProducts.push({ productId, quantity: item.quantity });
      }
    } catch (err) {
      // Rollback already decremented products
      for (const rolledBack of decrementedProducts) {
        await Product.updateOne(
          { _id: rolledBack.productId },
          { $inc: { quantity: rolledBack.quantity } }
        );
      }
      return res.status(400).json({ error: err.message || 'Stock allocation failed due to insufficient stock.' });
    }

    const serverTotal = validProducts.reduce((sum, item) => {
      const price = item.purchasePrice || item.product?.price || 0;
      return sum + (price * item.quantity);
    }, 0);

    const order = new Order({
      cart: cartId,
      user,
      address: addressId,
      total: serverTotal,
      status: 'Not_processed',
      isCancelled: false
    });

    const orderDoc = await order.save();

    let newOrder = {
      _id: orderDoc._id,
      created: orderDoc.created,
      user: req.user,
      total: orderDoc.total,
      products: validProducts
    };

    newOrder = store.calculateTaxAmount(newOrder);

    try {
      await smtp.sendEmail(req.user.email, 'order-confirmation', null, newOrder);
    } catch (emailError) {
      console.warn('Order confirmation email failed to send:', emailError.message);
    }

    res.status(200).json({
      success: true,
      message: `Your order has been placed successfully!`,
      order: { _id: orderDoc._id }
    });
  } catch (error) {
    res.status(500).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

// search orders api
router.get('/search', auth, async (req, res) => {
  try {
    const { search } = req.query;

    let ordersDoc = null;
    let query = {};

    if (req.user.role !== ROLES.Admin) {
      query.user = req.user._id;
    }

    if (Mongoose.Types.ObjectId.isValid(search)) {
      query._id = new Mongoose.Types.ObjectId(search);
      ordersDoc = await Order.find(query).populate({
        path: 'cart',
        populate: {
          path: 'products.product',
          populate: {
            path: 'brand'
          }
        }
      });
    } else {
      // Find matching products by name
      const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escapeRegExp(search || ''), 'is');
      const products = await Product.find({ name: { $regex: regex } });
      const productIds = products.map(p => p._id);

      // Find carts with these products
      const carts = await Cart.find({ 'products.product': { $in: productIds } });
      const cartIds = carts.map(c => c._id);

      // Query orders by matching carts or order status
      query.$or = [
        { cart: { $in: cartIds } },
        { status: { $regex: regex } }
      ];

      ordersDoc = await Order.find(query).populate({
        path: 'cart',
        populate: {
          path: 'products.product',
          populate: {
            path: 'brand'
          }
        }
      });
    }

    ordersDoc = ordersDoc.filter(order => order.cart);

    if (ordersDoc.length > 0) {
      const newOrders = ordersDoc.map(o => {
        return {
          _id: o._id,
          total: parseFloat(Number(o.total.toFixed(2))),
          created: o.created,
          status: o.status,
          products: o.cart?.products
        };
      });

      let orders = newOrders.map(o => store.calculateTaxAmount(o));
      orders.sort((a, b) => b.created - a.created);
      res.status(200).json({
        orders
      });
    } else {
      res.status(200).json({
        orders: []
      });
    }
  } catch (error) {
    res.status(500).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

// fetch orders api
router.get('/', auth, role.check(ROLES.Admin), async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const cappedLimit = Math.min(Number(limit) || 10, 100);
    const ordersDoc = await Order.find()
      .sort('-created')
      .populate({
        path: 'cart',
        populate: {
          path: 'products.product',
          populate: {
            path: 'brand'
          }
        }
      })
      .limit(cappedLimit)
      .skip((page - 1) * cappedLimit)
      .exec();

    const count = await Order.countDocuments();
    const orders = store.formatOrders(ordersDoc);

    res.status(200).json({
      orders,
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

// fetch my orders api
router.get('/me', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const cappedLimit = Math.min(Number(limit) || 10, 100);
    const user = req.user._id;
    const query = { user };

    const ordersDoc = await Order.find(query)
      .sort('-created')
      .populate({
        path: 'cart',
        populate: {
          path: 'products.product',
          populate: {
            path: 'brand'
          }
        }
      })
      .limit(cappedLimit)
      .skip((page - 1) * cappedLimit)
      .exec();

    const count = await Order.countDocuments(query);
    const orders = store.formatOrders(ordersDoc);

    res.status(200).json({
      orders,
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

// fetch order api
router.get('/:orderId', auth, async (req, res) => {
  try {
    const orderId = req.params.orderId;

    let orderDoc = null;

    if (req.user.role === ROLES.Admin) {
      orderDoc = await Order.findOne({ _id: orderId }).populate({
        path: 'cart',
        populate: {
          path: 'products.product',
          populate: {
            path: 'brand'
          }
        }
      });
    } else {
      const user = req.user._id;
      orderDoc = await Order.findOne({ _id: orderId, user }).populate({
        path: 'cart',
        populate: {
          path: 'products.product',
          populate: {
            path: 'brand'
          }
        }
      });
    }

    if (!orderDoc || !orderDoc.cart) {
      return res.status(404).json({
        message: `Cannot find order with the id: ${orderId}.`
      });
    }

    let order = {
      _id: orderDoc._id,
      total: orderDoc.total,
      created: orderDoc.created,
      status: orderDoc.status,
      totalTax: 0,
      products: orderDoc?.cart?.products,
      cartId: orderDoc.cart._id
    };

    order = store.calculateTaxAmount(order);

    res.status(200).json({
      order
    });
  } catch (error) {
    res.status(500).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

router.delete('/cancel/:orderId', auth, async (req, res) => {
  try {
    const orderId = req.params.orderId;

    const order = await Order.findOne({ _id: orderId })
      .populate('user')
      .populate({
        path: 'cart',
        populate: {
          path: 'products.product',
          populate: {
            path: 'brand'
          }
        }
      });

    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    if (req.user.role !== ROLES.Admin && String(order.user._id || order.user) !== String(req.user._id)) {
      return res.status(403).json({ error: 'Unauthorized to cancel this order.' });
    }

    // Guard: Enforce cancellation only when status is Not_processed or Processing
    if (order.status !== 'Not_processed' && order.status !== 'Processing') {
      return res.status(400).json({ error: 'Order cannot be cancelled at this stage.' });
    }

    const foundCart = await Cart.findOne({ _id: order.cart?._id || order.cart });
    if (foundCart) {
      await increaseQuantity(foundCart.products);
      foundCart.products.forEach(p => {
        p.status = CART_ITEM_STATUS.Cancelled;
      });
      await foundCart.save();
    }

    order.isCancelled = true;
    order.status = 'Cancelled';
    await order.save();

    let populatedOrder = {
      _id: order._id,
      total: order.total,
      created: order.created,
      user: order.user,
      products: order.cart?.products || []
    };

    populatedOrder = store.calculateTaxAmount(populatedOrder);

    if (order.user && order.user.email) {
      try {
        await smtp.sendEmail(order.user.email, 'order-cancellation', null, populatedOrder);
      } catch (emailError) {
        console.warn('Order cancellation email failed to send:', emailError.message);
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

router.put('/status/item/:itemId', auth, async (req, res) => {
  try {
    const itemId = req.params.itemId;
    const orderId = req.body.orderId;
    const cartId = req.body.cartId;
    const status = req.body.status || CART_ITEM_STATUS.Cancelled;

    const order = await Order.findOne({ _id: orderId });
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    const foundCart = await Cart.findOne({ 'products._id': itemId });
    if (!foundCart) {
      return res.status(404).json({ error: 'Cart item not found.' });
    }
    const foundCartProduct = foundCart.products.find(p => String(p._id) === String(itemId));

    if (status === CART_ITEM_STATUS.Cancelled) {
      if (foundCartProduct.status === CART_ITEM_STATUS.Shipped || foundCartProduct.status === CART_ITEM_STATUS.Delivered) {
        return res.status(400).json({ error: 'Item cannot be cancelled at this stage.' });
      }
    }

    if (req.user.role === ROLES.Merchant) {
      const product = await Product.findById(foundCartProduct.product).populate('brand');
      if (!product || !product.brand || String(product.brand.merchant) !== String(req.user.merchant)) {
        return res.status(403).json({ error: 'Unauthorized to update this item status.' });
      }
    } else if (req.user.role !== ROLES.Admin) {
      if (String(order.user) !== String(req.user._id)) {
        return res.status(403).json({ error: 'Unauthorized to access this order.' });
      }
      if (status !== CART_ITEM_STATUS.Cancelled) {
        return res.status(403).json({ error: 'Customers can only cancel items.' });
      }
    }

    await Cart.updateOne(
      { 'products._id': itemId },
      {
        'products.$.status': status
      }
    );

    if (status === CART_ITEM_STATUS.Cancelled) {
      await Product.updateOne(
        { _id: foundCartProduct.product },
        { $inc: { quantity: foundCartProduct.quantity } }
      );
    }

    await updateOrderOverallStatus(orderId, cartId);

    // Fetch updated order status and check if order overall status is Cancelled
    const updatedOrder = await Order.findById(orderId);
    if (updatedOrder && updatedOrder.status === 'Cancelled') {
      const orderDoc = await Order.findOne({ _id: orderId })
        .populate('user')
        .populate({
          path: 'cart',
          populate: {
            path: 'products.product',
            populate: {
              path: 'brand'
            }
          }
        });

      if (orderDoc && orderDoc.user && orderDoc.user.email) {
        let populatedOrder = {
          _id: orderDoc._id,
          total: orderDoc.total,
          created: orderDoc.created,
          user: orderDoc.user,
          products: orderDoc.cart?.products || []
        };
        populatedOrder = store.calculateTaxAmount(populatedOrder);
        try {
          await smtp.sendEmail(orderDoc.user.email, 'order-cancellation', null, populatedOrder);
        } catch (emailError) {
          console.warn('Order cancellation email failed to send:', emailError.message);
        }
      }

      return res.status(200).json({
        success: true,
        orderCancelled: true,
        message: `${req.user.role === ROLES.Admin ? 'Order' : 'Your order'
          } has been cancelled successfully`
      });
    }

    res.status(200).json({
      success: true,
      message: status === CART_ITEM_STATUS.Cancelled ? 'Item has been cancelled successfully!' : 'Item status has been updated successfully!'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

const increaseQuantity = async products => {
  let bulkOptions = products
    .filter(item => item && item.product)
    .map(item => {
      const productId = item.product._id || item.product;
      return {
        updateOne: {
          filter: { _id: productId },
          update: { $inc: { quantity: item.quantity } }
        }
      };
    });

  if (bulkOptions.length > 0) {
    await Product.bulkWrite(bulkOptions);
  }
};


const updateOrderOverallStatus = async (orderId, cartId) => {
  const cart = await Cart.findById(cartId);
  if (!cart) return;

  const order = await Order.findById(orderId);
  if (!order) return;

  const statuses = cart.products.map(p => p.status);

  if (statuses.every(s => s === 'Cancelled')) {
    order.status = 'Cancelled';
    order.isCancelled = true;
  } else if (statuses.every(s => s === 'Delivered')) {
    order.status = 'Delivered';
  } else if (statuses.some(s => s === 'Shipped' || s === 'Delivered')) {
    order.status = 'Shipped';
  } else if (statuses.some(s => s === 'Processing')) {
    order.status = 'Processing';
  } else {
    order.status = 'Not_processed';
  }
  await order.save();
};

module.exports = router;
