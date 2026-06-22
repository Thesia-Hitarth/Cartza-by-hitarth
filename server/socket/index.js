const socketio = require('socket.io');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const { ROLES } = require('../constants');
const keys = require('../config/keys');
const User = mongoose.model('User');

const support = require('./support');

const authHandler = async (socket, next) => {
  const { token = null } = socket.handshake.auth;
  if (token) {
    const [authType, tokenValue] = token.trim().split(' ');
    if (authType !== 'Bearer' || !tokenValue) {
      return next(new Error('no token'));
    }

    const { secret } = keys.jwt;
    let payload;
    try {
      payload = jwt.verify(tokenValue, secret);
    } catch (err) {
      return next(new Error('Invalid token'));
    }
    const id = payload.id.toString();
    const user = await User.findById(id);

    if (!user) {
      return next(new Error('no user found'));
    }

    const u = {
      id,
      role: user?.role,
      isAdmin: user.role === ROLES.Admin,
      name: `${user?.firstName} ${user?.lastName}`,
      socketId: socket.id,
      messages: []
    };

    const existingUser = support.findUserById(id);
    if (!existingUser) {
      support.users.push(u);
      if (support.users.length > 100) {
        // Evict first offline user to prevent memory leak
        const offlineIdx = support.users.findIndex(x => !x.online);
        if (offlineIdx !== -1) {
          support.users.splice(offlineIdx, 1);
        }
      }
    } else {
      existingUser.socketId = socket.id;
    }
  } else {
    return next(new Error('no token'));
  }

  next();
};

const socket = server => {
  const io = socketio(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.use(authHandler);

  const onConnection = socket => {
    support.supportHandler(io, socket);
  };

  io.on('connection', onConnection);
};

module.exports = socket;
