const express = require('express');
const router = express.Router();
const Order = require('../../models/order');
const Cart = require('../../models/cart');
const Product = require('../../models/product');
const Brand = require('../../models/brand');
const auth = require('../../middleware/auth');
const role = require('../../middleware/role');
const { ROLES } = require('../../constants');

router.get('/', auth, role.check(ROLES.Admin, ROLES.Merchant), async (req, res) => {
  try {
    let brandId = null;

    if (req.user.role === ROLES.Merchant) {
      const brand = await Brand.findOne({ merchant: req.user.merchant });
      if (!brand) {
        return res.status(200).json({
          salesOverTime: [],
          bestSellers: [],
          lowStock: [],
          totalRevenue: 0
        });
      }
      brandId = brand._id;
    }

    // 1. Get products for brand (or all if admin)
    const productQuery = brandId ? { brand: brandId } : {};
    const products = await Product.find(productQuery);
    const productIds = products.map(p => p._id);

    // 2. Low stock alert (quantity < 5)
    const lowStock = products
      .filter(p => p.quantity < 5)
      .map(p => ({
        _id: p._id,
        name: p.name,
        quantity: p.quantity,
        sku: p.sku
      }));

    // 3. Find carts containing brand products
    const cartQuery = { 'products.product': { $in: productIds } };
    const carts = await Cart.find(cartQuery);
    const cartIds = carts.map(c => c._id);

    // 4. Find completed/active orders matching these carts
    const orders = await Order.find({ cart: { $in: cartIds } }).populate({
      path: 'cart',
      populate: {
        path: 'products.product'
      }
    });

    // 5. Compute analytics: Revenue, Best Sellers, Sales Over Time
    let totalRevenue = 0;
    const bestSellersMap = {};
    const salesOverTimeMap = {};

    orders.forEach(order => {
      // Calculate order products matching merchant's brand
      let orderMerchantTotal = 0;
      if (order.cart && order.cart.products) {
        order.cart.products.forEach(item => {
          if (item.product && productIds.some(pid => String(pid) === String(item.product._id))) {
            const price = item.purchasePrice || item.product.price || 0;
            const quantity = item.quantity || 0;
            const lineTotal = price * quantity;
            orderMerchantTotal += lineTotal;

            // Add to best sellers
            const pidStr = String(item.product._id);
            if (!bestSellersMap[pidStr]) {
              bestSellersMap[pidStr] = {
                name: item.product.name,
                sku: item.product.sku,
                salesCount: 0,
                revenue: 0
              };
            }
            bestSellersMap[pidStr].salesCount += quantity;
            bestSellersMap[pidStr].revenue += lineTotal;
          }
        });
      }

      totalRevenue += orderMerchantTotal;

      // Group sales by day
      const dateStr = new Date(order.created).toISOString().split('T')[0];
      if (!salesOverTimeMap[dateStr]) {
        salesOverTimeMap[dateStr] = { date: dateStr, sales: 0, orders: 0 };
      }
      salesOverTimeMap[dateStr].sales += orderMerchantTotal;
      salesOverTimeMap[dateStr].orders += 1;
    });

    const bestSellers = Object.values(bestSellersMap)
      .sort((a, b) => b.salesCount - a.salesCount)
      .slice(0, 5);

    const salesOverTime = Object.values(salesOverTimeMap)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30); // Last 30 days

    res.status(200).json({
      salesOverTime,
      bestSellers,
      lowStock,
      totalRevenue
    });
  } catch (error) {
    res.status(500).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

module.exports = router;
