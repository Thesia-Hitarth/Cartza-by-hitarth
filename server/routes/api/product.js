const express = require('express');
const router = express.Router();
const multer = require('multer');
const Mongoose = require('mongoose');

// Bring in Models & Utils
const Product = require('../../models/product');
const Brand = require('../../models/brand');
const Category = require('../../models/category');
const auth = require('../../middleware/auth');
const role = require('../../middleware/role');
const checkAuth = require('../../utils/auth');
const { uploadImage } = require('../../utils/storage');
const { sanitizeHtml } = require('../../utils/sanitize');
const {
  getStoreProductsQuery,
  getStoreProductsWishListQuery
} = require('../../utils/queries');
const { ROLES } = require('../../constants');

router.param('id', (req, res, next, id) => {
  if (!Mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid product ID format.' });
  }
  next();
});

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, WebP, and GIF images are allowed.'), false);
    }
  }
});

// fetch product slug api
router.get('/item/:slug', async (req, res) => {
  try {
    const slug = req.params.slug;

    const productDoc = await Product.findOne({ slug, isActive: true }).populate(
      {
        path: 'brand',
        select: 'name isActive slug'
      }
    );

    const hasNoBrand =
      productDoc?.brand === null || productDoc?.brand?.isActive === false;

    if (!productDoc || hasNoBrand) {
      return res.status(404).json({
        message: 'No product found.'
      });
    }

    res.status(200).json({
      product: productDoc
    });
  } catch (error) {
    res.status(500).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

// fetch product name search api
router.get('/list/search/:name', async (req, res) => {
  try {
    const name = req.params.name;
    const { page = 1, limit = 10 } = req.query;
    const cappedLimit = Math.min(Number(limit) || 10, 100);
    const safePage = Math.max(1, parseInt(page) || 1);
    const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapeRegExp(name || ''), 'is');
    const query = { name: { $regex: regex }, isActive: true };

    const productDoc = await Product.find(
      query,
      { name: 1, slug: 1, imageUrl: 1, price: 1, _id: 0 }
    )
      .limit(cappedLimit)
      .skip((safePage - 1) * cappedLimit)
      .exec();

    const count = await Product.countDocuments(query);

    if (productDoc.length === 0) {
      return res.status(404).json({
        message: 'No product found.'
      });
    }

    res.status(200).json({
      products: productDoc,
      totalPages: Math.ceil(count / cappedLimit),
      currentPage: safePage,
      count
    });
  } catch (error) {
    res.status(500).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

// fetch store products by advanced filters api
router.get('/list', async (req, res) => {
  try {
    let {
      sortOrder,
      rating,
      max,
      min,
      category,
      brand,
      page = 1,
      limit = 10
    } = req.query;
    const cappedLimit = Math.min(Number(limit) || 10, 100);
    const safePage = Math.max(1, parseInt(page) || 1);
    const allowedSortFields = ['price', 'created', 'name'];
    let safeSort = { created: -1 };
    if (sortOrder) {
      try {
        const parsed = JSON.parse(sortOrder);
        const validated = {};
        for (const [key, value] of Object.entries(parsed)) {
          if (allowedSortFields.includes(key) && (value === 1 || value === -1)) {
            validated[key] = value;
          }
        }
        if (Object.keys(validated).length > 0) {
          safeSort = validated;
        }
      } catch (e) {
        // fallback to default
      }
    }

    const categoryFilter = category ? { category } : {};
    const basicQuery = getStoreProductsQuery(min, max, rating);

    const userDoc = await checkAuth(req);
    const categoryDoc = await Category.findOne({
      slug: categoryFilter.category,
      isActive: true
    });

    if (categoryDoc) {
      basicQuery.push({
        $match: {
          isActive: true,
          _id: {
            $in: Array.from(categoryDoc.products)
          }
        }
      });
    }

    const brandDoc = await Brand.findOne({
      slug: brand,
      isActive: true
    });

    if (brandDoc) {
      basicQuery.push({
        $match: {
          'brand._id': { $eq: brandDoc._id }
        }
      });
    }

    let products = null;
    const countQuery = [...basicQuery, { $count: 'total' }];
    const countResult = await Product.aggregate(countQuery);
    const count = countResult.length > 0 ? countResult[0].total : 0;
    const size = count > cappedLimit ? safePage - 1 : 0;
    const currentPage = count > cappedLimit ? safePage : 1;

    // paginate query
    const paginateQuery = [
      { $sort: safeSort },
      { $skip: size * cappedLimit },
      { $limit: cappedLimit }
    ];

    if (userDoc) {
      const wishListQuery = getStoreProductsWishListQuery(userDoc.id).concat(
        basicQuery
      );
      products = await Product.aggregate(wishListQuery.concat(paginateQuery));
    } else {
      products = await Product.aggregate(basicQuery.concat(paginateQuery));
    }

    res.status(200).json({
      products,
      totalPages: Math.ceil(count / cappedLimit),
      currentPage,
      count
    });
  } catch (error) {
    console.error('Product listing error:', error);
    res.status(500).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

router.get('/list/select', auth, async (req, res) => {
  try {
    const products = await Product.find({}, 'name');

    res.status(200).json({
      products
    });
  } catch (error) {
    res.status(500).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

// add product api
router.post(
  '/add',
  auth,
  role.check(ROLES.Admin, ROLES.Merchant),
  upload.single('image'),
  async (req, res) => {
    try {
      const sku = req.body.sku;
      const name = req.body.name;
      const description = sanitizeHtml(req.body.description);
      const quantity = req.body.quantity;
      const price = req.body.price;
      const compareAtPrice = req.body.compareAtPrice || null;
      const taxable = req.body.taxable;
      const isActive = req.body.isActive;
      const brand = req.body.brand;
      const image = req.file;

      if (!sku || typeof sku !== 'string' || !sku.trim()) {
        return res.status(400).json({ error: 'You must enter a SKU.' });
      }

      if (!name || typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({ error: 'You must enter a name.' });
      }

      if (!description || typeof description !== 'string' || !description.trim()) {
        return res.status(400).json({ error: 'You must enter a description.' });
      }

      const parsedQuantity = Number(quantity);
      if (isNaN(parsedQuantity) || parsedQuantity < 0) {
        return res.status(400).json({ error: 'Quantity must be a valid number greater than or equal to 0.' });
      }

      const parsedPrice = Number(price);
      if (isNaN(parsedPrice) || parsedPrice < 0) {
        return res.status(400).json({ error: 'Price must be a valid number greater than or equal to 0.' });
      }

      if (compareAtPrice !== undefined && compareAtPrice !== null) {
        const parsedCompare = Number(compareAtPrice);
        if (isNaN(parsedCompare) || parsedCompare < 0) {
          return res.status(400).json({ error: 'Compare At Price must be a valid number greater than or equal to 0.' });
        }
        if (parsedCompare <= parsedPrice) {
          return res.status(400).json({ error: 'Compare At Price must be greater than the sale Price.' });
        }
      }

      if (!brand) {
        return res.status(400).json({ error: 'Please select a brand.' });
      }

      if (req.user.role === ROLES.Merchant) {
        const brandDoc = await Brand.findById(brand);
        if (!brandDoc || String(brandDoc.merchant) !== String(req.user.merchant)) {
          return res.status(403).json({ error: 'Unauthorized to add product to this brand.' });
        }
      }

      const foundProduct = await Product.findOne({ sku });

      if (foundProduct) {
        return res.status(400).json({ error: 'This sku is already in use.' });
      }

      const { imageUrl, imageKey } = await uploadImage(image);

      const product = new Product({
        sku,
        name,
        description,
        quantity: parsedQuantity,
        price: parsedPrice,
        compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
        taxable,
        isActive,
        brand,
        imageUrl,
        imageKey
      });

      const savedProduct = await product.save();

      res.status(200).json({
        success: true,
        message: `Product has been added successfully!`,
        product: savedProduct
      });
    } catch (error) {
      return res.status(400).json({
        error: 'Your request could not be processed. Please try again.'
      });
    }
  }
);

// fetch products api
router.get(
  '/',
  auth,
  role.check(ROLES.Admin, ROLES.Merchant),
  async (req, res) => {
    try {
      const { page = 1, limit = 50 } = req.query;
      const cappedLimit = Math.min(Number(limit) || 50, 100);
      const safePage = Math.max(1, parseInt(page) || 1);
      let products = [];
      let count = 0;
      let query = {};

      if (req.user.merchant) {
        const brands = await Brand.find({
          merchant: req.user.merchant
        }).populate('merchant', '_id');

        const brandIds = brands.map(b => b._id);
        query = { brand: { $in: brandIds } };
      }

      products = await Product.find(query)
        .limit(cappedLimit)
        .skip((safePage - 1) * cappedLimit)
        .populate({
          path: 'brand',
          populate: {
            path: 'merchant',
            model: 'Merchant'
          }
        });

      count = await Product.countDocuments(query);

      res.status(200).json({
        products,
        totalPages: Math.ceil(count / cappedLimit),
        currentPage: safePage,
        count
      });
    } catch (error) {
      res.status(400).json({
        error: 'Your request could not be processed. Please try again.'
      });
    }
  }
);

// fetch product api
router.get(
  '/:id',
  auth,
  role.check(ROLES.Admin, ROLES.Merchant),
  async (req, res) => {
    try {
      const productId = req.params.id;

      let productDoc = null;

      if (req.user.merchant) {
        const brands = await Brand.find({
          merchant: req.user.merchant
        }).populate('merchant', '_id');

        const brandIds = brands.map(b => b._id);

        productDoc = await Product.findOne({ _id: productId, brand: { $in: brandIds } }).populate({
          path: 'brand',
          select: 'name'
        });
      } else {
        productDoc = await Product.findOne({ _id: productId }).populate({
          path: 'brand',
          select: 'name'
        });
      }

      if (!productDoc) {
        return res.status(404).json({
          message: 'No product found.'
        });
      }

      res.status(200).json({
        product: productDoc
      });
    } catch (error) {
      res.status(400).json({
        error: 'Your request could not be processed. Please try again.'
      });
    }
  }
);

router.put(
  '/:id',
  auth,
  role.check(ROLES.Admin, ROLES.Merchant),
  async (req, res) => {
    try {
      const productId = req.params.id;
      const query = { _id: productId };
      const {
        sku,
        name,
        description,
        quantity,
        price,
        compareAtPrice,
        taxable,
        isActive,
        brand,
        colors,
        sizes,
        variants
      } = req.body.product || {};

      const productDoc = await Product.findById(productId);
      if (!productDoc) {
        return res.status(404).json({ error: 'No product found.' });
      }

      if (req.user.role === ROLES.Merchant) {
        const brandDoc = await Brand.findById(productDoc.brand);
        if (!brandDoc || String(brandDoc.merchant) !== String(req.user.merchant)) {
          return res.status(403).json({ error: 'Unauthorized to edit this product.' });
        }
        if (brand !== undefined) {
          const newBrandDoc = await Brand.findById(brand);
          if (!newBrandDoc || String(newBrandDoc.merchant) !== String(req.user.merchant)) {
            return res.status(403).json({ error: 'Unauthorized to reassign product to this brand.' });
          }
        }
      }

      const update = {};
      if (sku !== undefined) update.sku = sku;
      if (name !== undefined) update.name = name;

      if (name) {
        const { generateUniqueSlug } = require('../../utils/slugify');
        update.slug = await generateUniqueSlug(Product, name, productId);
      } else if (req.body.product?.slug) {
        const { slugify } = require('../../utils/slugify');
        update.slug = slugify(req.body.product.slug);
      }

      const orQuery = [];
      if (sku) orQuery.push({ sku });
      if (update.slug) orQuery.push({ slug: update.slug });

      if (orQuery.length > 0) {
        const foundProduct = await Product.findOne({
          $or: orQuery
        });

        if (foundProduct && String(foundProduct._id) !== String(productId)) {
          return res
            .status(400)
            .json({ error: 'Sku or slug is already in use.' });
        }
      }

      if (description !== undefined) update.description = sanitizeHtml(description);
      if (quantity !== undefined) {
        const parsedQuantity = Number(quantity);
        if (isNaN(parsedQuantity) || parsedQuantity < 0) {
          return res.status(400).json({ error: 'Quantity must be a valid number greater than or equal to 0.' });
        }
        update.quantity = parsedQuantity;
      }
      if (price !== undefined) {
        const parsedPrice = Number(price);
        if (isNaN(parsedPrice) || parsedPrice < 0) {
          return res.status(400).json({ error: 'Price must be a valid number greater than or equal to 0.' });
        }
        update.price = parsedPrice;
      }

      const finalPrice = price !== undefined ? Number(price) : productDoc.price;
      const finalCompareAtPrice = compareAtPrice !== undefined ? (compareAtPrice === null || compareAtPrice === '' ? null : Number(compareAtPrice)) : productDoc.compareAtPrice;

      if (finalCompareAtPrice !== null && finalCompareAtPrice !== undefined) {
        if (isNaN(finalCompareAtPrice) || finalCompareAtPrice < 0) {
          return res.status(400).json({ error: 'Compare At Price must be a valid number greater than or equal to 0.' });
        }
        if (finalCompareAtPrice <= finalPrice) {
          return res.status(400).json({ error: 'Compare At Price must be greater than the sale Price.' });
        }
        if (compareAtPrice !== undefined) {
          update.compareAtPrice = finalCompareAtPrice;
        }
      } else if (compareAtPrice !== undefined) {
        update.compareAtPrice = null;
      }

      if (taxable !== undefined) update.taxable = taxable;
      if (isActive !== undefined) update.isActive = isActive;
      if (brand !== undefined) update.brand = brand;
      if (colors !== undefined) update.colors = colors;
      if (sizes !== undefined) update.sizes = sizes;
      if (variants !== undefined) update.variants = variants;
      update.updated = Date.now();

      await Product.findOneAndUpdate(query, update, {
        new: true
      });

      res.status(200).json({
        success: true,
        message: 'Product has been updated successfully!'
      });
    } catch (error) {
      res.status(400).json({
        error: 'Your request could not be processed. Please try again.'
      });
    }
  }
);

router.put(
  '/:id/active',
  auth,
  role.check(ROLES.Admin, ROLES.Merchant),
  async (req, res) => {
    try {
      const productId = req.params.id;
      const isActive = req.body.product?.isActive;
      if (typeof isActive !== 'boolean') {
        return res.status(400).json({ error: 'isActive must be a boolean.' });
      }
      const update = { isActive };
      const query = { _id: productId };

      if (req.user.role === ROLES.Merchant) {
        const productDoc = await Product.findById(productId).populate('brand');
        if (!productDoc || !productDoc.brand || String(productDoc.brand.merchant) !== String(req.user.merchant)) {
          return res.status(403).json({ error: 'Unauthorized to edit this product.' });
        }
      }

      await Product.findOneAndUpdate(query, update, {
        new: true
      });

      res.status(200).json({
        success: true,
        message: 'Product has been updated successfully!'
      });
    } catch (error) {
      res.status(400).json({
        error: 'Your request could not be processed. Please try again.'
      });
    }
  }
);

router.delete(
  '/delete/:id',
  auth,
  role.check(ROLES.Admin, ROLES.Merchant),
  async (req, res) => {
    try {
      const productId = req.params.id;

      if (req.user.role === ROLES.Merchant) {
        const productDoc = await Product.findById(productId).populate('brand');
        if (!productDoc || !productDoc.brand || String(productDoc.brand.merchant) !== String(req.user.merchant)) {
          return res.status(403).json({ error: 'Unauthorized to delete this product.' });
        }
      }

      const product = await Product.deleteOne({ _id: productId });

      res.status(200).json({
        success: true,
        message: `Product has been deleted successfully!`,
        product
      });
    } catch (error) {
      res.status(400).json({
        error: 'Your request could not be processed. Please try again.'
      });
    }
  }
);

router.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'File size must not exceed 5MB.' });
  }
  if (err.message) {
    return res.status(400).json({ error: err.message });
  }
  next(err);
});

module.exports = router;
