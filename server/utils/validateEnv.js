const REQUIRED_VARS = [
  'MONGO_URI',
  'JWT_SECRET'
];

module.exports = function validateEnv() {
  const missing = REQUIRED_VARS.filter(v => !process.env[v]);
  if (missing.length > 0) {
    console.error(`\x1b[31m[STARTUP ERROR] Missing required environment variables: ${missing.join(', ')}\x1b[0m`);
    process.exit(1);
  }
};
