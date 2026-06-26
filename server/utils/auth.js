const jwt = require('jsonwebtoken');
const keys = require('../config/keys');

const checkAuth = async req => {
  try {
    if (!req.headers.authorization) {
      return null;
    }

    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, keys.jwt.secret);
    return decoded;
  } catch (error) {
    return null;
  }
};

module.exports = checkAuth;
