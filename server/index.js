require('dotenv').config();
require('./utils/validateEnv')();
const Sentry = require('@sentry/node');

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development'
  });
}

const express = require('express');
const chalk = require('chalk');
const cors = require('cors');
const helmet = require('helmet');

const keys = require('./config/keys');
const routes = require('./routes');
const setupDB = require('./utils/db');

const { port } = keys;
const app = express();

if (process.env.SENTRY_DSN) {
  app.use(Sentry.Handlers.requestHandler());
}

app.set('trust proxy', 1);

app.use(express.urlencoded({ extended: true }));
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

const csrfProtection = require('./middleware/csrf');
app.use(csrfProtection);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: process.env.NODE_ENV === 'production'
          ? ["'self'", "https://api.razorpay.com", "https://res.cloudinary.com", "https://client.crisp.chat", "wss://client.crisp.chat", "https://storage.crisp.chat"]
          : ["'self'", "http://localhost:3000", "http://localhost:8080", "ws://localhost:8080", "https://api.razorpay.com", "https://res.cloudinary.com", "https://client.crisp.chat", "wss://client.crisp.chat", "https://storage.crisp.chat"],
        fontSrc: ["'self'", "fonts.gstatic.com", "data:", "https://client.crisp.chat"],
        imgSrc: ["'self'", "data:", "res.cloudinary.com", "https://image.crisp.chat", "https://client.crisp.chat"],
        scriptSrc: process.env.NODE_ENV === 'production'
          ? ["'self'", "'unsafe-inline'", "https://checkout.razorpay.com", "https://client.crisp.chat", "https://storage.googleapis.com"]
          : ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://checkout.razorpay.com", "https://client.crisp.chat", "https://storage.googleapis.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com", "https://client.crisp.chat"],
        frameSrc: ["'self'", "https://game.crisp.chat", "https://challenges.cloudflare.com", "https://hcaptcha.com"],
        mediaSrc: ["'self'", "https://client.crisp.chat"]
      }
    },
    crossOriginEmbedderPolicy: false,
    frameguard: true
  })
);

// Add Permissions-Policy to lock down device APIs and X-Robots-Tag for preview deployments
app.use((req, res, next) => {
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== 'production') {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  }
  next();
});

const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.NODE_ENV !== 'production' ? 'http://localhost:8080' : null
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

setupDB();
require('./config/passport')(app);
app.use(routes);

if (process.env.SENTRY_DSN) {
  app.use(Sentry.Handlers.errorHandler());
}

if (!process.env.VERCEL && process.env.NODE_ENV !== 'test') {
  const { runAbandonedCartJob } = require('./jobs/abandonedCart');
  runAbandonedCartJob();

  app.listen(port, () => {
    console.log(
      `${chalk.green('✓')} ${chalk.blue(
        `Listening on port ${port}. Visit http://localhost:${port}/ in your browser.`
      )}`
    );
  });
}

module.exports = app;
