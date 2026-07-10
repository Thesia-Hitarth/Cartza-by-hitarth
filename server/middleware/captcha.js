const axios = require('axios');

const validateCaptcha = async (req, res, next) => {
  const secretKey = process.env.TURNSTILE_SECRET_KEY || process.env.HCAPTCHA_SECRET_KEY;
  const token = req.body.captchaToken;

  // Skip validation in non-production environments if no secret key is set
  if (process.env.NODE_ENV !== 'production' && !secretKey) {
    console.log('Skipping CAPTCHA verification in development (no secret key configured).');
    return next();
  }

  if (!secretKey) {
    return res.status(500).json({ error: 'CAPTCHA configuration is missing.' });
  }

  if (!token) {
    return res.status(400).json({ error: 'CAPTCHA verification token is missing. Please solve the CAPTCHA.' });
  }

  try {
    // Cloudflare Turnstile verification or hCaptcha verification
    const verifyUrl = process.env.HCAPTCHA_SECRET_KEY 
      ? 'https://hcaptcha.com/siteverify' 
      : 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

    const response = await axios.post(
      verifyUrl,
      `secret=${secretKey}&response=${token}`,
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    if (response.data && response.data.success) {
      return next();
    } else {
      return res.status(400).json({ error: 'CAPTCHA verification failed. Please try again.' });
    }
  } catch (error) {
    console.error('CAPTCHA verification error:', error);
    return res.status(500).json({ error: 'Error validating CAPTCHA. Please try again.' });
  }
};

module.exports = validateCaptcha;
