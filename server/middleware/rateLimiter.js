/**
 * rateLimiter.js
 * Production-safe rate limiting factory.
 *
 * - If UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN are configured:
 *   Uses @upstash/redis directly via an INCR/EXPIRE fixed-window pattern.
 *   Each limiter gets a unique key prefix so there are NO shared stores.
 *
 * - Otherwise: falls back to express-rate-limit in-memory store (dev / test).
 */

const rateLimit = require('express-rate-limit');

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

let redis = null;

if (redisUrl && redisToken) {
  try {
    const { Redis } = require('@upstash/redis');
    redis = new Redis({ url: redisUrl, token: redisToken });
    console.log('Upstash Redis connected for rate limiting.');
  } catch (e) {
    console.error('Failed to initialise Upstash Redis for rate limiting:', e);
  }
} else {
  console.log('UPSTASH_REDIS_REST_URL/TOKEN not provided. Rate limiter falling back to in-memory store.');
}

// Auto-incrementing counter to give every limiter a distinct prefix
let _limiterIndex = 0;

/**
 * Creates a Redis-backed fixed-window rate-limiter middleware using
 * @upstash/redis INCR + EXPIRE — no rate-limit-redis required.
 *
 * @param {string} prefix   - Unique key namespace for this limiter
 * @param {number} windowMs - Window duration in ms
 * @param {number} max      - Max allowed requests per window
 * @param {string} message  - 429 error message
 */
const createRedisLimiter = (prefix, windowMs, max, message) => {
  const windowSec = Math.ceil(windowMs / 1000);

  return async (req, res, next) => {
    if (req.method === 'OPTIONS') return next();

    const ip = req.ip || req.socket?.remoteAddress || 'unknown';
    const windowSlot = Math.floor(Date.now() / windowMs);
    const key = `rl:${prefix}:${ip}:${windowSlot}`;

    try {
      const count = await redis.incr(key);
      if (count === 1) {
        // Set TTL only on first increment to avoid resetting expiry on each request
        await redis.expire(key, windowSec);
      }

      res.setHeader('RateLimit-Limit', max);
      res.setHeader('RateLimit-Remaining', Math.max(0, max - count));

      if (count > max) {
        return res.status(429).json({
          error: message || 'Too many requests, please try again later.'
        });
      }

      next();
    } catch (err) {
      // Fail open — log the error but don't block the request
      console.error('Redis rate limiter error (failing open):', err.message);
      next();
    }
  };
};

/**
 * Factory that creates a configured rate-limiter middleware.
 *
 * @param {object} options
 * @param {number} options.windowMs  - Time window in ms (default: 15 minutes)
 * @param {number} options.max       - Maximum requests per windowMs (default: 100)
 * @param {string} options.message   - Error message returned on 429
 */
const rateLimiter = (options = {}) => {
  const { windowMs = 15 * 60 * 1000, max = 100, message } = options;

  // Each call gets its own unique prefix so limiters never share state
  const prefix = `lim${++_limiterIndex}`;

  if (redis) {
    return createRedisLimiter(prefix, windowMs, max, message);
  }

  // In-memory fallback (development / test)
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: message || 'Too many requests, please try again later.' },
    skip: (req) => req.method === 'OPTIONS'
  });
};

module.exports = rateLimiter;
