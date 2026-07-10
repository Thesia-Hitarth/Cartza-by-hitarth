const Sentry = require('@sentry/node');

// Initialize Sentry if DSN is configured in environment variables
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development'
  });
}

const isProduction = process.env.NODE_ENV === 'production';

const formatLog = (level, message, meta) => {
  if (isProduction) {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(meta || {})
    });
  } else {
    return `[${level.toUpperCase()}] ${message} ${meta ? JSON.stringify(meta) : ''}`;
  }
};

const logger = {
  info: (message, meta) => {
    console.log(formatLog('info', message, meta));
  },
  warn: (message, meta) => {
    console.warn(formatLog('warn', message, meta));
  },
  error: (error, message = 'An error occurred') => {
    const errorDetails = {
      errorMessage: error.message,
      errorStack: error.stack
    };
    if (isProduction) {
      console.error(formatLog('error', message, errorDetails));
    } else {
      console.error(`[ERROR] ${message}:`, error.stack || error.message || error);
    }
    if (process.env.SENTRY_DSN) {
      Sentry.captureException(error);
    }
  }
};

module.exports = logger;
