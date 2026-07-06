process.env.MONGO_URI = 'mongodb://localhost:27017/test_cartza';
process.env.JWT_SECRET = 'supersecretjwtkeytestingonly12345';
process.env.JWT_EXPIRATION = '7d';

const Mongoose = require('mongoose');

// Mock setupDB so we don't connect to a real database
jest.mock('../utils/db', () => jest.fn());

// Mock node-cron
jest.mock('node-cron', () => ({
  schedule: jest.fn().mockImplementation((pattern, fn) => {
    // Expose the function so we can manually run it in tests
    global.abandonedCartCronTask = fn;
  })
}));

// Mock SMTP service
jest.mock('../services/smtp', () => ({
  sendEmail: jest.fn().mockResolvedValue({ success: true })
}));

// Require models
require('../models/user');
const Cart = require('../models/cart');
const smtp = require('../services/smtp');
const { runAbandonedCartJob } = require('../jobs/abandonedCart');
const request = require('supertest');
const app = require('../index');

describe('Abandoned Cart Recovery Job', () => {
  beforeAll(() => {
    runAbandonedCartJob();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('should process abandoned carts and send recovery emails via cron task', async () => {
    const mockCart = {
      _id: new Mongoose.Types.ObjectId(),
      user: {
        firstName: 'Alice',
        email: 'alice@example.com'
      },
      products: [{ product: new Mongoose.Types.ObjectId(), quantity: 1 }],
      save: jest.fn().mockResolvedValue(true)
    };

    const findSpy = jest.spyOn(Cart, 'find').mockReturnValue({
      populate: jest.fn().mockResolvedValue([mockCart])
    });

    // Run the scheduler task function manually
    await global.abandonedCartCronTask();

    expect(findSpy).toHaveBeenCalled();
    expect(smtp.sendEmail).toHaveBeenCalledWith(
      'alice@example.com',
      'abandoned-cart',
      expect.any(String),
      mockCart
    );
    expect(mockCart.save).toHaveBeenCalled();
    expect(mockCart.recoveryEmailSentAt).toBeInstanceOf(Date);
  });

  it('should reset recoveryEmailSentAt to null on pre-save if products are modified', () => {
    const cart = new Cart({
      user: new Mongoose.Types.ObjectId(),
      products: [{ product: new Mongoose.Types.ObjectId(), quantity: 1 }],
      recoveryEmailSentAt: new Date()
    });

    const saveHooks = Cart.schema.s.hooks._pres.get('save') || [];
    const hookObj = saveHooks.find(h => h.fn.toString().includes('recoveryEmailSentAt'));

    expect(hookObj).toBeDefined();

    const next = jest.fn();
    hookObj.fn.call(cart, next);

    expect(cart.recoveryEmailSentAt).toBeNull();
    expect(next).toHaveBeenCalled();
  });

  it('should process abandoned carts and send recovery emails via API endpoint (local/dev bypass)', async () => {
    const mockCart = {
      _id: new Mongoose.Types.ObjectId(),
      user: {
        firstName: 'Bob',
        email: 'bob@example.com'
      },
      products: [{ product: new Mongoose.Types.ObjectId(), quantity: 1 }],
      save: jest.fn().mockResolvedValue(true)
    };

    const findSpy = jest.spyOn(Cart, 'find').mockReturnValue({
      populate: jest.fn().mockResolvedValue([mockCart])
    });

    // Make request to local API (in test mode, CRON_SECRET bypass is enabled as it is not production)
    const res = await request(app)
      .get('/api/jobs/abandoned-cart')
      .send();

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.emailsSent).toBe(1);
    expect(findSpy).toHaveBeenCalled();
    expect(smtp.sendEmail).toHaveBeenCalledWith(
      'bob@example.com',
      'abandoned-cart',
      expect.any(String),
      mockCart
    );
    expect(mockCart.save).toHaveBeenCalled();
  });
});
