process.env.MONGO_URI = 'mongodb://localhost:27017/test_cartza';
process.env.JWT_SECRET = 'supersecretjwtkeytestingonly12345';
process.env.JWT_EXPIRATION = '7d';

const request = require('supertest');

// Mock setupDB so we don't connect to db
jest.mock('../utils/db', () => jest.fn());
jest.mock('../utils/storage', () => ({
  uploadImage: jest.fn().mockResolvedValue({ imageUrl: 'http://test.com/img.jpg', imageKey: 'img' })
}));

// Require models to register schemas before App loads passport
require('../models/user');
require('../models/newsletter');
const Product = require('../models/product');
const Brand = require('../models/brand');
const { ROLES } = require('../constants');

let mockTestUser = null;

// Mock passport authenticate, use, and initialize middleware
jest.mock('passport', () => {
  return {
    initialize: jest.fn().mockReturnValue((req, res, next) => next()),
    use: jest.fn(),
    authenticate: jest.fn().mockImplementation(() => (req, res, next) => {
      if (mockTestUser) {
        req.user = mockTestUser;
      }
      next();
    })
  };
});

const app = require('../index');

describe('Product Endpoints', () => {
  let findSpy;
  let countDocumentsSpy;

  beforeEach(() => {
    mockTestUser = {
      _id: 'mockadminid',
      role: ROLES.Admin
    };
    findSpy = jest.spyOn(Product, 'find');
    countDocumentsSpy = jest.spyOn(Product, 'countDocuments');
  });

  afterEach(() => {
    findSpy.mockRestore();
    countDocumentsSpy.mockRestore();
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  describe('GET /api/product/list/search/:name', () => {
    it('should cap the limit and handle page variables correctly', async () => {
      findSpy.mockReturnValue({
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([
          { name: 'Product 1', slug: 'product-1', price: 10 }
        ])
      });
      countDocumentsSpy.mockResolvedValue(1);

      const res = await request(app)
        .get('/api/product/list/search/test?limit=999999&page=-1');

      expect(res.status).toBe(200);
      expect(res.body.products.length).toBe(1);
      expect(res.body.currentPage).toBe(1);
    });
  });

  describe('PUT /api/product/:id - Variants Update', () => {
    it('should automatically compute and sync colors and sizes when variants are updated', async () => {
      const productId = new (require('mongoose')).Types.ObjectId().toString();
      const mockProduct = {
        _id: productId,
        brand: new (require('mongoose')).Types.ObjectId().toString(),
        price: 100,
        compareAtPrice: null
      };

      jest.spyOn(Product, 'findById').mockResolvedValue(mockProduct);
      const findOneAndUpdateSpy = jest.spyOn(Product, 'findOneAndUpdate').mockResolvedValue(mockProduct);

      const res = await request(app)
        .put(`/api/product/${productId}`)
        .send({
          product: {
            variants: [
              { color: 'Red', size: 'M', quantity: 5, sku: 'SKU-R-M' },
              { color: 'Blue', size: 'L', quantity: 10, sku: 'SKU-B-L' }
            ]
          }
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(findOneAndUpdateSpy).toHaveBeenCalledWith(
        expect.objectContaining({ _id: productId }),
        expect.objectContaining({
          variants: expect.any(Array),
          colors: ['Red', 'Blue'],
          sizes: ['M', 'L']
        }),
        expect.any(Object)
      );
    });
  });
});
