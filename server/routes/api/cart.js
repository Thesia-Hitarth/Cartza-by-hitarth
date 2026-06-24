const express = require('express');
const router = express.Router();

// Bring in Models & Utils
const Cart = require('../../models/cart');
const Product = require('../../models/product');
const auth = require('../../middleware/auth');
const store = require('../../utils/store');

router.post('/add', auth, async (req, res) => {
  try {
    const user = req.user._id;
    const items = req.body.products;

    const products = store.caculateItemsSalesTax(items);

    const cart = new Cart({
      user,
      products
    });

    const cartDoc = await cart.save();

    res.status(200).json({
      success: true,
      cartId: cartDoc.id
    });
  } catch (error) {
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

router.delete('/delete/:cartId', auth, async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cartId);
    if (!cart || String(cart.user) !== String(req.user._id)) {
      return res.status(403).json({ error: 'Unauthorized to modify this cart.' });
    }
    await Cart.deleteOne({ _id: req.params.cartId });

    res.status(200).json({
      success: true
    });
  } catch (error) {
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

router.post('/add/:cartId', auth, async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cartId);
    if (!cart || String(cart.user) !== String(req.user._id)) {
      return res.status(403).json({ error: 'Unauthorized to modify this cart.' });
    }

    const rawProduct = req.body.product;
    const [product] = store.caculateItemsSalesTax([rawProduct]);

    await Cart.updateOne({ _id: req.params.cartId }, { $push: { products: product } });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(400).json({ error: 'Your request could not be processed. Please try again.' });
  }
});

router.delete('/delete/:cartId/:productId', auth, async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cartId);
    if (!cart || String(cart.user) !== String(req.user._id)) {
      return res.status(403).json({ error: 'Unauthorized to modify this cart.' });
    }
    const product = { product: req.params.productId };
    const query = { _id: req.params.cartId };

    await Cart.updateOne(query, { $pull: { products: product } }).exec();

    res.status(200).json({
      success: true
    });
  } catch (error) {
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

router.put('/update-quantity/:cartId', auth, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const cart = await Cart.findById(req.params.cartId);
    if (!cart || String(cart.user) !== String(req.user._id)) {
      return res.status(403).json({ error: 'Unauthorized to modify this cart.' });
    }

    const parsedQty = Number(quantity);
    if (isNaN(parsedQty) || parsedQty < 1) {
      return res.status(400).json({ error: 'Quantity must be at least 1.' });
    }

    const productItem = cart.products.find(item => String(item.product) === String(productId));
    if (!productItem) {
      return res.status(404).json({ error: 'Product not found in cart.' });
    }

    const isTaxable = productItem.totalTax > 0 || (productItem.priceWithTax > productItem.totalPrice);
    const taxRate = require('../../config/tax').stateTaxRate;

    productItem.quantity = parsedQty;
    productItem.totalPrice = parseFloat(Number((productItem.purchasePrice * parsedQty).toFixed(2)));

    if (isTaxable) {
      const taxAmount = productItem.purchasePrice * taxRate;
      productItem.totalTax = parseFloat(Number((taxAmount * parsedQty).toFixed(2)));
      productItem.priceWithTax = parseFloat(Number((productItem.totalPrice + productItem.totalTax).toFixed(2)));
    } else {
      productItem.totalTax = 0;
      productItem.priceWithTax = productItem.totalPrice;
    }

    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Cart item quantity updated successfully.',
      cart
    });
  } catch (error) {
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

module.exports = router;
