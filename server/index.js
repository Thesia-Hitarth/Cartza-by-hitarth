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
          ? ["'self'", "https://api.razorpay.com", "https://res.cloudinary.com"]
          : ["'self'", "http://localhost:3000", "http://localhost:8080", "ws://localhost:8080", "https://api.razorpay.com", "https://res.cloudinary.com"],
        fontSrc: ["'self'", "fonts.gstatic.com", "data:"],
        imgSrc: ["'self'", "data:", "res.cloudinary.com"],
        scriptSrc: process.env.NODE_ENV === 'production'
          ? ["'self'", "https://checkout.razorpay.com"]
          : ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://checkout.razorpay.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"]
      }
    },
    crossOriginEmbedderPolicy: false,
    frameguard: true
  })
);
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
