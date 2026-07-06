process.env.MONGO_URI = 'mongodb://localhost:27017/test_cartza';
process.env.JWT_SECRET = 'supersecretjwtkeytestingonly12345';
process.env.JWT_EXPIRATION = '7d';

const request = require('supertest');
const Mongoose = require('mongoose');

// Mock setupDB so we don't connect to a real database
jest.mock('../utils/db', () => jest.fn());

// Require models
require('../models/user');
const Product = require('../models/product');
const Brand = require('../models/brand');
const Cart = require('../models/cart');
const Order = require('../models/order');
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

describe('Merchant Analytics API', () => {
  beforeEach(() => {
    mockTestUser = {
      _id: new Mongoose.Types.ObjectId().toString(),
      role: ROLES.Merchant,
      merchant: new Mongoose.Types.ObjectId().toString()
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('should compute brand revenue, salesCount, lowStock, and salesOverTime correctly', async () => {
    const brandId = new Mongoose.Types.ObjectId();
    const productId = new Mongoose.Types.ObjectId();

    // 1. Mock brand fetch
    jest.spyOn(Brand, 'findOne').mockResolvedValue({ _id: brandId });

    // 2. Mock product fetch (returns low stock product)
    jest.spyOn(Product, 'find').mockResolvedValue([
      {
        _id: productId,
        name: 'Brand Shirt',
        sku: 'SHIRT123',
        quantity: 3, // < 5, should show in low stock
        price: 250
      }
    ]);

    // 3. Mock cart search
    const cartId = new Mongoose.Types.ObjectId();
    jest.spyOn(Cart, 'find').mockResolvedValue([{ _id: cartId }]);

    // 4. Mock order fetch
    const mockOrder = {
      _id: new Mongoose.Types.ObjectId(),
      created: new Date().toISOString(),
      cart: {
        _id: cartId,
        products: [
          {
            product: { _id: productId, name: 'Brand Shirt', sku: 'SHIRT123' },
            quantity: 2,
            purchasePrice: 250
          }
        ]
      }
    };
    jest.spyOn(Order, 'find').mockReturnValue({
      populate: jest.fn().mockResolvedValue([mockOrder])
    });

    const res = await request(app)
      .get('/api/analytics')
      .send();

    expect(res.status).toBe(200);
    expect(res.body.totalRevenue).toBe(500); // 2 * 250
    expect(res.body.bestSellers.length).toBe(1);
    expect(res.body.bestSellers[0].salesCount).toBe(2);
    expect(res.body.lowStock.length).toBe(1);
    expect(res.body.lowStock[0].name).toBe('Brand Shirt');
    expect(res.body.salesOverTime.length).toBe(1);
    expect(res.body.salesOverTime[0].sales).toBe(500);
  });
});
