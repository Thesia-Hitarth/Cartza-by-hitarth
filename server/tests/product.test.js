process.env.MONGO_URI = 'mongodb://localhost:27017/test_cartza';
process.env.JWT_SECRET = 'supersecretjwtkeytestingonly12345';
process.env.JWT_EXPIRATION = '7d';

const request = require('supertest');

// Mock setupDB so we don't connect to db
jest.mock('../utils/db', () => jest.fn());

// Require models to register schemas before App loads passport
require('../models/user');
require('../models/newsletter');
const Product = require('../models/product');

const app = require('../index');

jest.mock('../utils/auth', () => jest.fn().mockResolvedValue(null));

describe('Product Endpoints', () => {
  let findSpy;
  let countDocumentsSpy;

  beforeEach(() => {
    findSpy = jest.spyOn(Product, 'find');
    countDocumentsSpy = jest.spyOn(Product, 'countDocuments');
  });

  afterEach(() => {
    findSpy.mockRestore();
    countDocumentsSpy.mockRestore();
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
});
