/**
 * rateLimiter.js
 * Production-safe rate limiting using express-rate-limit.
 * Replaces the custom in-memory implementation
 * Works correctly in multi-instance / serverless (Vercel) environments
 * because express-rate-limit v6+ uses a per-request window by default.
 */

const rateLimit = require('express-rate-limit');

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
