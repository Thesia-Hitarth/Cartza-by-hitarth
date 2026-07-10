const REQUIRED_VARS = [
  'MONGO_URI',
  'JWT_SECRET'
];

module.exports = function validateEnv() {
  const missing = REQUIRED_VARS.filter(v => !process.env[v]);

  if (process.env.NODE_ENV === 'production') {
    if (!process.env.UPSTASH_REDIS_REST_URL) {
      missing.push('UPSTASH_REDIS_REST_URL');
    }
    if (!process.env.UPSTASH_REDIS_REST_TOKEN) {
      missing.push('UPSTASH_REDIS_REST_TOKEN');
    }
    const siteKey = process.env.TURNSTILE_SITE_KEY || process.env.HCAPTCHA_SITE_KEY;
    if (siteKey) {
      if (!process.env.TURNSTILE_SECRET_KEY && !process.env.HCAPTCHA_SECRET_KEY) {
        missing.push('TURNSTILE_SECRET_KEY or HCAPTCHA_SECRET_KEY');
      }
    }
  }

  if (missing.length > 0) {
    console.error(`\x1b[31m[STARTUP ERROR] Missing required environment variables: ${missing.join(', ')}\x1b[0m`);
    process.exit(1);
  }
};
