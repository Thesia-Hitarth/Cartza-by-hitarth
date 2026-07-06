process.env.MONGO_URI = 'mongodb://localhost:27017/test_cartza';
process.env.JWT_SECRET = 'supersecretjwtkeytestingonly12345';
process.env.JWT_EXPIRATION = '7d';

const request = require('supertest');
const Mongoose = require('mongoose');

// Mock setupDB so we don't connect to db
jest.mock('../utils/db', () => jest.fn());

// Require models first so schemas are registered before passport loads them
const User = require('../models/user');
const Newsletter = require('../models/newsletter');

const app = require('../index');

jest.mock('../services/smtp', () => ({
  sendEmail: jest.fn().mockResolvedValue(true)
}));

describe('Auth Endpoints', () => {
  let findOneSpy;
  let saveSpy;

  beforeEach(() => {
    findOneSpy = jest.spyOn(User, 'findOne');
    saveSpy = jest.spyOn(User.prototype, 'save');
  });

  afterEach(() => {
    findOneSpy.mockRestore();
    saveSpy.mockRestore();
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should validate password length <= 128 characters', async () => {
      const longPassword = 'a'.repeat(129);
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          password: longPassword
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Password must be 128 characters or fewer.');
    });

    it('should register a valid user successfully', async () => {
      findOneSpy.mockResolvedValue(null);
      saveSpy.mockResolvedValue({
        id: 'mockuserid',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'ROLE_MEMBER',
        jwtSeed: 1
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          password: 'Password123!'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.email).toBe('test@example.com');
    });
  });
});
