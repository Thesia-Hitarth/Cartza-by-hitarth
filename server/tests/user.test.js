process.env.MONGO_URI = 'mongodb://localhost:27017/test_cartza';
process.env.JWT_SECRET = 'supersecretjwtkeytestingonly12345';
process.env.JWT_EXPIRATION = '7d';

const request = require('supertest');
const Mongoose = require('mongoose');

// Mock setupDB so we don't connect to a real database
jest.mock('../utils/db', () => jest.fn());

// Require models to register schemas
require('../models/user');
const User = require('../models/user');
const Address = require('../models/address');
const Wishlist = require('../models/wishlist');
const Cart = require('../models/cart');

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

describe('User Account Endpoints', () => {
  beforeEach(() => {
    mockTestUser = {
      _id: new Mongoose.Types.ObjectId().toString(),
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      jwtSeed: 1
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('should anonymize user, increment jwtSeed, and clear token cookie on self-deletion', async () => {
    const findByIdAndUpdateSpy = jest.spyOn(User, 'findByIdAndUpdate').mockResolvedValue({
      _id: mockTestUser._id,
      jwtSeed: 2
    });
    const deleteAddressSpy = jest.spyOn(Address, 'deleteMany').mockResolvedValue({ deletedCount: 0 });
    const deleteWishlistSpy = jest.spyOn(Wishlist, 'deleteMany').mockResolvedValue({ deletedCount: 0 });
    const deleteCartSpy = jest.spyOn(Cart, 'deleteMany').mockResolvedValue({ deletedCount: 0 });

    const res = await request(app)
      .delete('/api/user/me')
      .send();

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Your account has been successfully deleted.');
    
    // Assert user was anonymized and jwtSeed was incremented
    expect(findByIdAndUpdateSpy).toHaveBeenCalledWith(
      mockTestUser._id,
      expect.objectContaining({
        firstName: 'Deleted',
        lastName: 'User',
        email: `deleted_${mockTestUser._id}@deleted.invalid`,
        $inc: { jwtSeed: 1 }
      })
    );

    // Assert related models were cleaned up
    expect(deleteAddressSpy).toHaveBeenCalledWith({ user: mockTestUser._id });
    expect(deleteWishlistSpy).toHaveBeenCalledWith({ user: mockTestUser._id });
    expect(deleteCartSpy).toHaveBeenCalledWith({ user: mockTestUser._id });

    // Assert cookie was cleared
    const cookies = res.headers['set-cookie'] || [];
    const hasClearedCookie = cookies.some(cookie => cookie.startsWith('token=') && (cookie.includes('Expires=Thu, 01 Jan 1970 00:00:00 GMT') || cookie.includes('Max-Age=0')));
    expect(hasClearedCookie).toBe(true);
  });
});
