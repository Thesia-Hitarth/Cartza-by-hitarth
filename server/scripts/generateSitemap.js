const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('../models/product');
const Brand = require('../models/brand');
const Category = require('../models/category');

const clientUrl = process.env.CLIENT_URL || 'https://cartza-by-hitarth.vercel.app';

const generateSitemap = async () => {
  try {
    console.log('Connecting to database...');
    // Default to the MONGO_URI from env or local fallback for tests
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/cartza';
    await mongoose.connect(mongoUri);

    console.log('Fetching active products, brands, categories...');
    const products = await Product.find({ isActive: true });
    const brands = await Brand.find({ isActive: true });
    const categories = await Category.find({ isActive: true });

    const staticRoutes = [
      { path: '', priority: '1.0', changefreq: 'daily' },
      { path: 'shop', priority: '0.8', changefreq: 'daily' },
      { path: 'brands', priority: '0.5', changefreq: 'monthly' },
      { path: 'sell', priority: '0.3', changefreq: 'monthly' },
      { path: 'contact', priority: '0.3', changefreq: 'monthly' }
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // 1. Add static routes
    const today = new Date().toISOString().split('T')[0];
    for (const route of staticRoutes) {
      xml += `  <url>\n`;
      xml += `    <loc>${clientUrl}/${route.path}</loc>\n`;
      xml += `    <lastmod>${today}</lastmod>\n`;
      xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
      xml += `    <priority>${route.priority}</priority>\n`;
      xml += `  </url>\n`;
    }

    // 2. Add products
    for (const product of products) {
      if (product.slug) {
        const lastmod = product.updated ? new Date(product.updated).toISOString().split('T')[0] : today;
        xml += `  <url>\n`;
        xml += `    <loc>${clientUrl}/product/${product.slug}</loc>\n`;
        xml += `    <lastmod>${lastmod}</lastmod>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.7</priority>\n`;
        xml += `  </url>\n`;
      }
    }

    // 3. Add brands
    for (const brand of brands) {
      if (brand.slug) {
        const lastmod = brand.updated ? new Date(brand.updated).toISOString().split('T')[0] : today;
        xml += `  <url>\n`;
        xml += `    <loc>${clientUrl}/shop/brand/${brand.slug}</loc>\n`;
        xml += `    <lastmod>${lastmod}</lastmod>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.6</priority>\n`;
        xml += `  </url>\n`;
      }
    }

    // 4. Add categories
    for (const cat of categories) {
      if (cat.slug) {
        const lastmod = cat.updated ? new Date(cat.updated).toISOString().split('T')[0] : today;
        xml += `  <url>\n`;
        xml += `    <loc>${clientUrl}/shop/category/${cat.slug}</loc>\n`;
        xml += `    <lastmod>${lastmod}</lastmod>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.6</priority>\n`;
        xml += `  </url>\n`;
      }
    }

    xml += `</urlset>\n`;

    const outputPath = path.join(__dirname, '../../client/public/sitemap.xml');
    fs.writeFileSync(outputPath, xml);
    console.log(`Successfully generated sitemap with ${staticRoutes.length + products.length + brands.length + categories.length} links!`);
  } catch (error) {
    console.error('Failed to generate sitemap:', error);
  } finally {
    await mongoose.disconnect();
  }
};

generateSitemap();
