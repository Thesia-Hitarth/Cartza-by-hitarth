process.env.MONGO_URI = 'mongodb://localhost:27017/test_cartza';
process.env.JWT_SECRET = 'supersecretjwtkeytestingonly12345';
process.env.JWT_EXPIRATION = '7d';

const request = require('supertest');
const Mongoose = require('mongoose');

// Mock setupDB so we don't connect to a real database
jest.mock('../utils/db', () => jest.fn());
jest.mock('../services/smtp', () => ({
  sendEmail: jest.fn().mockResolvedValue(true)
}));

// Require models to register schemas before Passport loads them
require('../models/user');
const Merchant = require('../models/merchant');
const User = require('../models/user');
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

describe('Merchant Active Status Endpoints', () => {
  beforeEach(() => {
    mockTestUser = {
      _id: new Mongoose.Types.ObjectId().toString(),
      role: ROLES.Admin
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('should return 400 if isActive is not provided as boolean', async () => {
    const merchantId = new Mongoose.Types.ObjectId().toString();

    const res = await request(app)
      .put(`/api/merchant/${merchantId}/active`)
      .send({
        merchant: {
          brandName: 'New Brand'
        }
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('isActive must be a boolean.');
  });

  it('should return 404 if merchant does not exist', async () => {
    const merchantId = new Mongoose.Types.ObjectId().toString();

    jest.spyOn(Merchant, 'findOneAndUpdate').mockResolvedValue(null);

    const res = await request(app)
      .put(`/api/merchant/${merchantId}/active`)
      .send({
        merchant: {
          isActive: true
        }
      });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Merchant not found.');
  });

  it('should update isActive status successfully', async () => {
    const merchantId = new Mongoose.Types.ObjectId().toString();
    const mockMerchant = {
      _id: merchantId,
      email: 'merchant@example.com',
      isActive: true
    };

    const findOneAndUpdateSpy = jest.spyOn(Merchant, 'findOneAndUpdate').mockResolvedValue(mockMerchant);

    const res = await request(app)
      .put(`/api/merchant/${merchantId}/active`)
      .send({
        merchant: {
          isActive: true
        }
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(findOneAndUpdateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ _id: merchantId }),
      { isActive: true },
      expect.any(Object)
    );
  });
});

describe('Merchant Invite Signup Endpoint', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('should return 400 if user with matching invite token is not found or expired', async () => {
    jest.spyOn(User, 'findOne').mockResolvedValue(null);

    const res = await request(app)
      .post('/api/merchant/signup/mocktoken')
      .send({
        email: 'merchant@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'Password123!'
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid or expired signup token.');
    expect(User.findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'merchant@example.com',
        inviteToken: expect.any(String),
        inviteTokenExpires: expect.any(Object)
      })
    );
  });

  it('should sign up merchant successfully and clear invite fields', async () => {
    const userDoc = {
      _id: new Mongoose.Types.ObjectId(),
      email: 'merchant@example.com'
    };

    jest.spyOn(User, 'findOne').mockResolvedValue(userDoc);
    jest.spyOn(User, 'findOneAndUpdate').mockResolvedValue(userDoc);
    jest.spyOn(Merchant, 'findOne').mockResolvedValue({
      _id: new Mongoose.Types.ObjectId(),
      email: 'merchant@example.com',
      brandName: 'Test Brand',
      business: 'Some description'
    });
    jest.spyOn(Brand, 'findOne').mockResolvedValue({
      _id: new Mongoose.Types.ObjectId()
    });

    const res = await request(app)
      .post('/api/merchant/signup/mocktoken')
      .send({
        email: 'merchant@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'Password123!'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(User.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: userDoc._id },
      expect.objectContaining({
        inviteToken: undefined,
        inviteTokenExpires: undefined,
        password: expect.any(String)
      }),
      expect.any(Object)
    );
  });
});
