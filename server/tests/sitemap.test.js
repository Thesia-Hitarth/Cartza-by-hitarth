process.env.MONGO_URI = 'mongodb://localhost:27017/test_cartza';
process.env.JWT_SECRET = 'supersecretjwtkeytestingonly12345';
process.env.JWT_EXPIRATION = '7d';

const mongoose = require('mongoose');
const fs = require('fs');

// Mock setupDB so we don't connect to a real database
jest.mock('../utils/db', () => jest.fn());

// Mock fs.writeFileSync
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  writeFileSync: jest.fn()
}));

// Require models
const Product = require('../models/product');
const Brand = require('../models/brand');
const Category = require('../models/category');

describe('Sitemap Generator', () => {
  beforeEach(() => {
    jest.spyOn(mongoose, 'connect').mockResolvedValue(true);
    jest.spyOn(mongoose, 'disconnect').mockResolvedValue(true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('should generate sitemap.xml with products, brands, and categories', async () => {
    const mockProduct = { slug: 'test-product', updated: new Date() };
    const mockBrand = { slug: 'test-brand', updated: new Date() };
    const mockCategory = { slug: 'test-category', updated: new Date() };

    jest.spyOn(Product, 'find').mockResolvedValue([mockProduct]);
    jest.spyOn(Brand, 'find').mockResolvedValue([mockBrand]);
    jest.spyOn(Category, 'find').mockResolvedValue([mockCategory]);

    // Require to execute the script
    require('../scripts/generateSitemap');

    // Wait a tiny bit for the async function inside to complete
    await new Promise(resolve => setTimeout(resolve, 500));

    expect(mongoose.connect).toHaveBeenCalled();
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining('sitemap.xml'),
      expect.stringContaining('/product/test-product')
    );
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining('sitemap.xml'),
      expect.stringContaining('/shop/brand/test-brand')
    );
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining('sitemap.xml'),
      expect.stringContaining('/shop/category/test-category')
    );
    expect(mongoose.disconnect).toHaveBeenCalled();
  });
});
