const jwt = require('jsonwebtoken');
const keys = require('../config/keys');
const User = require('../models/user');

const optionalAuth = async (req, res, next) => {
  try {
    let token = null;
    if (req.headers.authorization) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.headers.cookie) {
      const value = `; ${req.headers.cookie}`;
      const parts = value.split(`; token=`);
      if (parts.length === 2) {
        token = decodeURIComponent(parts.pop().split(';').shift());
        if (token.startsWith('Bearer ')) {
          token = token.slice(7).trim();
        }
      }
    }

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, keys.jwt.secret);
    const user = await User.findById(decoded.id);
    if (user && user.jwtSeed === decoded.jwtSeed) {
      req.user = user;
    }
    next();
  } catch (error) {
    // Fail silently to next() so user continues as guest if token is invalid/expired
    next();
  }
};

module.exports = optionalAuth;
