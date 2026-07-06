const Sentry = require('@sentry/node');

// Initialize Sentry if DSN is configured in environment variables
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development'
  });
}

const logger = {
  info: (message, meta) => {
    console.log(`[INFO] ${message}`, meta ? JSON.stringify(meta) : '');
  },
  warn: (message, meta) => {
    console.warn(`[WARN] ${message}`, meta ? JSON.stringify(meta) : '');
  },
  error: (error, message = 'An error occurred') => {
    console.error(`[ERROR] ${message}:`, error.stack || error.message || error);
    if (process.env.SENTRY_DSN) {
      Sentry.captureException(error);
    }
  }
};

module.exports = logger;
