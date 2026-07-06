const Order = require('../models/order');
const Cart = require('../models/cart');
const Product = require('../models/product');
const Address = require('../models/address');
const User = require('../models/user');
const smtp = require('./smtp');
const store = require('../utils/store');

async function createOrder({ cartId, addressId, userId, couponCode, guestEmail, guestName }) {
  // 1. Validate address
  let addr;
  if (userId) {
    addr = await Address.findOne({ _id: addressId, user: userId });
  } else {
    addr = await Address.findById(addressId);
  }
  if (!addr) {
    throw new Error('Invalid address selected.');
  }

  // 2. Fetch cart
  let cartDoc;
  if (userId) {
    cartDoc = await Cart.findOne({ _id: cartId, user: userId }).populate({
      path: 'products.product',
      populate: {
        path: 'brand'
      }
    });
  } else {
    cartDoc = await Cart.findById(cartId).populate({
      path: 'products.product',
      populate: {
        path: 'brand'
      }
    });
  }

  if (!cartDoc || !cartDoc.products || cartDoc.products.length === 0) {
    throw new Error('Cannot place an order with an empty cart.');
  }

  // Filter out deleted products (null references)
  const validProducts = cartDoc.products.filter(item => item.product !== null);
  if (validProducts.length === 0) {
    throw new Error('Cannot place an order with no valid products.');
  }

  // 3. Decrement stock atomically and verify success
  const decrementedProducts = [];
  try {
    for (const item of validProducts) {
      const productId = item.product._id || item.product;
      const col = item.color || 'Default';
      const sz = item.size || 'Default';
      let updatedProduct = null;

      if (item.product.variants && item.product.variants.length > 0) {
        updatedProduct = await Product.findOneAndUpdate(
          {
            _id: productId,
            variants: {
              $elemMatch: {
                color: col,
                size: sz,
                quantity: { $gte: item.quantity }
              }
            }
          },
          {
            $inc: {
              quantity: -item.quantity,
              'variants.$.quantity': -item.quantity
            }
          },
          { new: true }
        );
        if (!updatedProduct) {
          throw new Error(`Insufficient stock for product: ${item.product.name} (${col} / ${sz})`);
        }
        decrementedProducts.push({
          productId,
          quantity: item.quantity,
          color: col,
          size: sz,
          hasVariants: true
        });
      } else {
        updatedProduct = await Product.findOneAndUpdate(
          { _id: productId, quantity: { $gte: item.quantity } },
          { $inc: { quantity: -item.quantity } },
          { new: true }
        );
        if (!updatedProduct) {
          throw new Error(`Insufficient stock for product: ${item.product.name}`);
        }
        decrementedProducts.push({
          productId,
          quantity: item.quantity,
          hasVariants: false
        });
      }
    }
  } catch (err) {
    // Rollback already decremented products
    for (const rolledBack of decrementedProducts) {
      if (rolledBack.hasVariants) {
        await Product.updateOne(
          {
            _id: rolledBack.productId,
            'variants.color': rolledBack.color,
            'variants.size': rolledBack.size
          },
          {
            $inc: {
              quantity: rolledBack.quantity,
              'variants.$.quantity': rolledBack.quantity
            }
          }
        );
      } else {
        await Product.updateOne(
          { _id: rolledBack.productId },
          { $inc: { quantity: rolledBack.quantity } }
        );
      }
    }
    throw new Error(err.message || 'Stock allocation failed due to insufficient stock.');
  }

  // 4. Calculate total
  let serverTotal = validProducts.reduce((sum, item) => {
    const price = item.purchasePrice || item.product?.price || 0;
    return sum + (price * item.quantity);
  }, 0);

  let discountAmount = 0;
  let appliedCoupon = null;

  if (couponCode) {
    const Coupon = require('../models/coupon');
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
    if (coupon) {
      const isExpired = coupon.expiresAt && new Date(coupon.expiresAt) < new Date();
      const hasUses = coupon.maxUses === null || coupon.usedCount < coupon.maxUses;
      const meetsMin = serverTotal >= coupon.minOrderValue;

      if (!isExpired && hasUses && meetsMin) {
        appliedCoupon = coupon;
        if (coupon.type === 'percentage') {
          discountAmount = (serverTotal * coupon.value) / 100;
        } else if (coupon.type === 'fixed') {
          discountAmount = coupon.value;
        }
        discountAmount = Math.min(discountAmount, serverTotal);
        serverTotal -= discountAmount;
      }
    }
  }

  // 5. Save order
  const order = new Order({
    cart: cartId,
    user: userId || null,
    guestEmail: guestEmail || null,
    guestName: guestName || null,
    address: addressId,
    total: parseFloat(serverTotal.toFixed(2)),
    coupon: appliedCoupon ? appliedCoupon._id : null,
    discount: parseFloat(discountAmount.toFixed(2)),
    status: 'Not_processed',
    isCancelled: false
  });

  const orderDoc = await order.save();

  // If a coupon was successfully applied, update its usage count
  if (appliedCoupon) {
    appliedCoupon.usedCount += 1;
    await appliedCoupon.save();
  }

  // 6. Send confirmation email
  const emailRecipient = userId ? (await User.findById(userId))?.email : guestEmail;
  if (emailRecipient) {
    const userObject = userId
      ? await User.findById(userId)
      : { firstName: guestName || 'Guest', lastName: '', email: guestEmail };
    let newOrder = {
      _id: orderDoc._id,
      created: orderDoc.created,
      user: userObject,
      total: orderDoc.total,
      products: validProducts
    };
    newOrder = store.calculateTaxAmount(newOrder);
    try {
      await smtp.sendEmail(emailRecipient, 'order-confirmation', null, newOrder);
    } catch (emailError) {
      console.warn('Order confirmation email failed to send:', emailError.message);
    }
  }

  return orderDoc;
}

module.exports = {
  createOrder
};
