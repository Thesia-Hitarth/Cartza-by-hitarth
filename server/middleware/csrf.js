const crypto = require('crypto');

const csrfProtection = (req, res, next) => {
  // 1. Generate CSRF token for GET requests if not present
  if (req.method === 'GET') {
    let token = null;
    if (req.headers.cookie) {
      const parts = `; ${req.headers.cookie}`.split('; XSRF-TOKEN=');
      if (parts.length === 2) {
        token = parts.pop().split(';').shift();
      }
    }

    if (!token) {
      const newToken = crypto.randomBytes(24).toString('hex');
      res.cookie('XSRF-TOKEN', newToken, {
        httpOnly: false, // Must be accessible to Axios/JS client
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
      });
    }
    return next();
  }

  // 2. Validate CSRF token for mutating requests (POST, PUT, DELETE)
  if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
    // Skip verification for webhook callbacks or in test environment
    if (process.env.NODE_ENV === 'test') {
      return next();
    }
    if (req.originalUrl && req.originalUrl.startsWith('/api/webhook')) {
      return next();
    }

    let cookieToken = null;
    if (req.headers.cookie) {
      const parts = `; ${req.headers.cookie}`.split('; XSRF-TOKEN=');
      if (parts.length === 2) {
        cookieToken = parts.pop().split(';').shift();
      }
    }

    const headerToken = req.headers['x-xsrf-token'];

    if (!cookieToken || !headerToken || cookieToken !== headerToken) {
      return res.status(403).json({ error: 'CSRF token validation failed.' });
    }
  }

  next();
};

module.exports = csrfProtection;
