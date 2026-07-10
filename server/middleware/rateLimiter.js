/**
 * rateLimiter.js
 * Production-safe rate limiting using express-rate-limit.
 * Replaces the custom in-memory implementation
 * Works correctly in multi-instance / serverless (Vercel) environments
 * by backing the limiter with Upstash Redis via rate-limit-redis when configured.
 */

const rateLimit = require('express-rate-limit');

let store;
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

if (redisUrl && redisToken) {
  try {
    const { Redis } = require('@upstash/redis');
    const { RedisStore } = require('rate-limit-redis');
    const redis = new Redis({
      url: redisUrl,
      token: redisToken,
    });
    store = new RedisStore({
      sendCommand: async (...args) => {
        // args is an array like ['eval', script, 1, key, expiry, weight]
        // @upstash/redis call expects a single array containing the command and arguments
        return await redis.call(args);
      }
    });
    console.log('RedisStore configured successfully for rate limiter.');
  } catch (error) {
    console.error('Failed to configure RedisStore for rate limiter:', error);
  }
} else {
  console.log('UPSTASH_REDIS_REST_URL/TOKEN not provided. Rate limiter falling back to in-memory store.');
}

/**
 * Factory that creates a configured rate-limiter middleware.
 * @param {object} options
 * @param {number} options.windowMs   - Time window in ms (default: 15 minutes)
 * @param {number} options.max        - Maximum requests per windowMs (default: 100)
 * @param {string} options.message    - Error message returned on 429
 */
const rateLimiter = (options = {}) => {
  const { windowMs = 15 * 60 * 1000, max = 100, message } = options;

  return rateLimit({
    windowMs,
    max,
    store, // Falls back to default MemoryStore if undefined
    standardHeaders: true,   // Return rate-limit info in the `RateLimit-*` headers
    legacyHeaders: false,     // Disable the `X-RateLimit-*` headers
    message: {
      error: message || 'Too many requests, please try again later.'
    },
    // trust proxy header for Vercel / other reverse-proxied deployments
    skip: (req) => req.method === 'OPTIONS'
  });
};

module.exports = rateLimiter;

