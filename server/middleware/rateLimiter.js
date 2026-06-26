const rateLimitStore = {};

const rateLimiter = (options) => {
  const { windowMs, max, message } = options;
  return (req, res, next) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const now = Date.now();

    if (!rateLimitStore[ip]) {
      rateLimitStore[ip] = [];
    }

    // Filter out requests older than windowMs
    rateLimitStore[ip] = rateLimitStore[ip].filter(timestamp => now - timestamp < windowMs);

    if (rateLimitStore[ip].length >= max) {
      return res.status(429).json({
        error: message || 'Too many requests, please try again later.'
      });
    }

    rateLimitStore[ip].push(now);
    next();
  };
};

module.exports = rateLimiter;
