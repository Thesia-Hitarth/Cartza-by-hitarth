const express = require('express');
const router = express.Router();

// Bring in Models & Utils
const Cart = require('../../models/cart');
const Product = require('../../models/product');
const auth = require('../../middleware/auth');
const store = require('../../utils/store');
const taxRate = require('../../config/tax').stateTaxRate;

async function validateAndEnrichProduct(productId, requestedQty, color, size) {
  const dbProduct = await Product.findById(productId);
  if (!dbProduct) {
    throw Object.assign(new Error(`Product not found: ${productId}`), { status: 404 });
  }
  if (!dbProduct.isActive) {
    throw Object.assign(new Error(`Product is no longer available.`), { status: 400 });
  }
  const qty = Number(requestedQty) || 1;
  const col = color || 'Default';
  const sz = size || 'Default';

  if (dbProduct.variants && dbProduct.variants.length > 0) {
    const variant = dbProduct.variants.find(v => v.color === col && v.size === sz);
    if (!variant) {
      throw Object.assign(
        new Error(`Variant (${col} / ${sz}) for "${dbProduct.name}" does not exist.`),
        { status: 400 }
      );
    }
    if (variant.quantity < qty) {
      throw Object.assign(
        new Error(`Only ${variant.quantity} unit(s) of "${dbProduct.name}" (${col} / ${sz}) available.`),
        { status: 400 }
      );
    }
  } else {
    if (dbProduct.quantity < qty) {
      throw Object.assign(
        new Error(`Only ${dbProduct.quantity} unit(s) of "${dbProduct.name}" available.`),
        { status: 400 }
      );
    }
  }

  return {
    product: dbProduct._id,
    purchasePrice: dbProduct.price,
    price: dbProduct.price,
    quantity: qty,
    color: col,
    size: sz,
    taxable: dbProduct.taxable
  };
}

router.post('/add', auth, async (req, res) => {
  try {
    const user = req.user._id;
    const items = req.body.products;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Cart must contain at least one product.' });
    }

    // Validate and enrich each product from DB
    const enrichedItems = await Promise.all(
      items.map(item => validateAndEnrichProduct(item._id || item.product, item.quantity, item.color, item.size))
    );

    const products = store.calculateItemsSalesTax(enrichedItems);

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
    res.status(error.status || 400).json({
      error: error.message || 'Your request could not be processed. Please try again.'
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
    const productId = rawProduct?._id || rawProduct?.product;
    const color = rawProduct?.color || 'Default';
    const size = rawProduct?.size || 'Default';

    const existingIndex = cart.products.findIndex(
      p => String(p.product) === String(productId) && p.color === color && p.size === size
    );

    if (existingIndex > -1) {
      const newQty = cart.products[existingIndex].quantity + (Number(rawProduct?.quantity) || 1);
      const enriched = await validateAndEnrichProduct(productId, newQty, color, size);
      const [product] = store.calculateItemsSalesTax([enriched]);
      cart.products[existingIndex] = product;
      await cart.save();
    } else {
      const enriched = await validateAndEnrichProduct(productId, rawProduct?.quantity || 1, color, size);
      const [product] = store.calculateItemsSalesTax([enriched]);
      cart.products.push(product);
      await cart.save();
    }
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(error.status || 400).json({ error: error.message || 'Your request could not be processed. Please try again.' });
  }
});

router.delete('/delete/:cartId/:productId', auth, async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cartId);
    if (!cart || String(cart.user) !== String(req.user._id)) {
      return res.status(403).json({ error: 'Unauthorized to modify this cart.' });
    }
    cart.products = cart.products.filter(
      p => String(p.product) !== String(req.params.productId)
    );
    await cart.save();

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

    const dbProduct = await Product.findById(productId);
    if (!dbProduct || !dbProduct.isActive) {
      return res.status(400).json({ error: 'Product is no longer available.' });
    }

    const productItem = cart.products.find(item => String(item.product) === String(productId));
    if (!productItem) {
      return res.status(404).json({ error: 'Product not found in cart.' });
    }

    if (dbProduct.variants && dbProduct.variants.length > 0) {
      const col = productItem.color || 'Default';
      const sz = productItem.size || 'Default';
      const variant = dbProduct.variants.find(v => v.color === col && v.size === sz);
      if (!variant) {
        return res.status(400).json({
          error: `Variant (${col} / ${sz}) for "${dbProduct.name}" does not exist.`
        });
      }
      if (variant.quantity < parsedQty) {
        return res.status(400).json({
          error: `Only ${variant.quantity} unit(s) of "${dbProduct.name}" (${col} / ${sz}) available.`
        });
      }
    } else {
      if (dbProduct.quantity < parsedQty) {
        return res.status(400).json({
          error: `Only ${dbProduct.quantity} unit(s) available for "${dbProduct.name}".`
        });
      }
    }

    const isTaxable = productItem.totalTax > 0 || (productItem.priceWithTax > productItem.totalPrice);

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
