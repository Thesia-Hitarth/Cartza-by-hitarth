process.env.MONGO_URI = 'mongodb://localhost:27017/test_cartza';
process.env.JWT_SECRET = 'supersecretjwtkeytestingonly12345';
process.env.JWT_EXPIRATION = '7d';

const request = require('supertest');
const Mongoose = require('mongoose');

// Mock setupDB so we don't connect to a real database
jest.mock('../utils/db', () => jest.fn());

// Require models to register schemas before Passport loads them
require('../models/user');
const Cart = require('../models/cart');
const Address = require('../models/address');
const Order = require('../models/order');
require('../models/product');
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

describe('Order Security and IDOR Endpoints', () => {
  beforeEach(() => {
    mockTestUser = null;
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  describe('POST /api/order/initiate - User A cannot checkout with User B\'s cart', () => {
    it('should return 400 when User A tries to checkout with a cart belonging to User B', async () => {
      mockTestUser = {
        _id: new Mongoose.Types.ObjectId().toString(),
        isEmailVerified: true,
        role: ROLES.Member
      };

      const mockAddress = {
        _id: new Mongoose.Types.ObjectId().toString(),
        user: mockTestUser._id
      };

      const mockCartId = new Mongoose.Types.ObjectId().toString();

      // Spy on Address findOne to return User A's address
      jest.spyOn(Address, 'findOne').mockResolvedValue(mockAddress);

      // Spy on Cart findOne to return a query chain that populates to null
      jest.spyOn(Cart, 'findOne').mockReturnValue({
        populate: jest.fn().mockResolvedValue(null)
      });

      const res = await request(app)
        .post('/api/order/initiate')
        .send({
          cartId: mockCartId,
          addressId: mockAddress._id
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Cannot checkout with an empty cart.');
    });
  });

  describe('PUT /api/order/:orderId - Merchant brand ownership enforcement', () => {
    it('should block Merchant A from updating tracking details of an order containing only Merchant B\'s products', async () => {
      mockTestUser = {
        _id: new Mongoose.Types.ObjectId().toString(),
        role: ROLES.Merchant,
        merchant: new Mongoose.Types.ObjectId().toString()
      };

      const otherMerchantId = new Mongoose.Types.ObjectId().toString();
      const mockOrderId = new Mongoose.Types.ObjectId().toString();
      const mockCartId = new Mongoose.Types.ObjectId().toString();

      const mockOrder = {
        _id: mockOrderId,
        cart: mockCartId
      };

      const mockCart = {
        _id: mockCartId,
        products: [
          {
            product: {
              _id: new Mongoose.Types.ObjectId().toString(),
              brand: {
                _id: new Mongoose.Types.ObjectId().toString(),
                merchant: otherMerchantId
              }
            }
          }
        ]
      };

      // Mock Order and Cart lookup
      jest.spyOn(Order, 'findById').mockResolvedValue(mockOrder);
      jest.spyOn(Cart, 'findById').mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockCart)
      });

      const res = await request(app)
        .put(`/api/order/${mockOrderId}`)
        .send({
          trackingNumber: 'TRACK123',
          carrier: 'FedEx'
        });

      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Unauthorized to update tracking details for this order.');
    });
  });
});
