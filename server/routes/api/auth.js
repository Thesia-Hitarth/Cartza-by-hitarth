const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const passport = require('passport');

const auth = require('../../middleware/auth');

// Bring in Models & Helpers
const User = require('../../models/user');
const smtp = require('../../services/smtp');
const keys = require('../../config/keys');
const Newsletter = require('../../models/newsletter');
const rateLimiter = require('../../middleware/rateLimiter');
const { EMAIL_PROVIDER } = require('../../constants');
const validator = require('validator');

const { secret, tokenLife } = keys.jwt;

const authLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many attempts, please try again after 15 minutes.'
});




router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !validator.isEmail(String(email))) {
      return res
        .status(400)
        .json({ error: 'You must enter a valid email address.' });
    }

    if (!password) {
      return res.status(400).json({ error: 'You must enter a password.' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || user.provider !== EMAIL_PROVIDER.Email) {
      return res.status(400).json({
        error: 'Invalid email or password.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        error: 'Invalid email or password.'
      });
    }

    const payload = {
      id: user.id,
      jwtSeed: user.jwtSeed
    };

    const token = jwt.sign(payload, secret, { expiresIn: tokenLife });

    if (!token) {
      throw new Error();
    }

    const jwtToken = `Bearer ${token}`;
    res.cookie('token', jwtToken, {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });

    res.status(200).json({
      success: true,
      token: jwtToken,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error) {
    res.status(500).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

router.post('/register', authLimiter, async (req, res) => {
  try {
    const { email, firstName, lastName, password, isSubscribed } = req.body;

    if (!email || !validator.isEmail(String(email))) {
      return res
        .status(400)
        .json({ error: 'You must enter a valid email address.' });
    }

    if (!firstName || !lastName) {
      return res.status(400).json({ error: 'You must enter your full name.' });
    }

    if (!password) {
      return res.status(400).json({ error: 'You must enter a password.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    }
    if (password.length > 128) {
      return res.status(400).json({ error: 'Password must be 128 characters or fewer.' });
    }
    if (!/[a-zA-Z]/.test(password) || !/[0-9!@#$%^&*]/.test(password)) {
      return res.status(400).json({ error: 'Password must contain at least one letter and one number or special character.' });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res
        .status(400)
        .json({ error: 'That email address is already in use.' });
    }

    let subscribed = false;
    if (isSubscribed === true) {
      const emailLower = email.trim().toLowerCase();
      const existingSubscription = await Newsletter.findOne({ email: emailLower });
      if (!existingSubscription) {
        const subscription = new Newsletter({ email: emailLower });
        await subscription.save();
        subscribed = true;
      }
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenHash = crypto.createHash('sha256').update(verificationToken).digest('hex');

    const user = new User({
      email,
      password,
      firstName,
      lastName,
      isEmailVerified: false,
      emailVerificationToken: verificationTokenHash,
      emailVerificationExpires: Date.now() + 24 * 3600 * 1000 // 24 hours
    });

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(user.password, salt);

    user.password = hash;
    const registeredUser = await user.save();

    const payload = {
      id: registeredUser.id,
      jwtSeed: registeredUser.jwtSeed
    };

    try {
      await smtp.sendEmail(
        registeredUser.email,
        'verify-email',
        keys.app.clientURL,
        verificationToken
      );
    } catch (emailError) {
      console.warn('Verification email failed to send:', emailError.message);
    }

    const token = jwt.sign(payload, secret, { expiresIn: tokenLife });
    const jwtToken = `Bearer ${token}`;

    res.cookie('token', jwtToken, {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });

    res.status(200).json({
      success: true,
      subscribed,
      token: jwtToken,
      user: {
        id: registeredUser.id,
        firstName: registeredUser.firstName,
        lastName: registeredUser.lastName,
        email: registeredUser.email,
        role: registeredUser.role,
        isEmailVerified: registeredUser.isEmailVerified
      }
    });
  } catch (error) {
    res.status(500).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

router.post('/forgot', authLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ error: 'You must enter an email address.' });
    }

    const existingUser = await User.findOne({ email });

    const genericResponse = {
      success: true,
      message: 'Please check your email for the link to reset your password.'
    };

    if (!existingUser) {
      return res.status(200).json(genericResponse);
    }

    const buffer = crypto.randomBytes(48);
    const resetToken = buffer.toString('hex');

    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    existingUser.resetPasswordToken = resetTokenHash;
    existingUser.resetPasswordExpires = Date.now() + 3600000;

    await existingUser.save();

    await smtp.sendEmail(
      existingUser.email,
      'reset',
      keys.app.clientURL,
      resetToken
    );

    res.status(200).json(genericResponse);
  } catch (error) {
    res.status(500).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

router.get('/verify-email/:token', async (req, res) => {
  try {
    const tokenHash = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      emailVerificationToken: tokenHash,
      emailVerificationExpires: { $gt: Date.now() }
    }).select('+emailVerificationToken +emailVerificationExpires');

    if (!user) {
      return res.status(400).json({
        error: 'Your verification link is invalid or has expired.'
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Your email has been verified successfully! You can now checkout and review products.'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

router.post('/resend-verification', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    if (user.isEmailVerified) {
      return res.status(400).json({ error: 'This email is already verified.' });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenHash = crypto.createHash('sha256').update(verificationToken).digest('hex');

    user.emailVerificationToken = verificationTokenHash;
    user.emailVerificationExpires = Date.now() + 24 * 3600 * 1000; // 24 hours
    await user.save();

    try {
      await smtp.sendEmail(
        user.email,
        'verify-email',
        keys.app.clientURL,
        verificationToken
      );
    } catch (emailError) {
      console.warn('Verification email failed to send:', emailError.message);
      return res.status(500).json({ error: 'Failed to send verification email. Please try again later.' });
    }

    res.status(200).json({
      success: true,
      message: 'A new verification link has been sent to your email address.'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

router.post('/reset/:token', async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'You must enter a password.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    }
    if (password.length > 128) {
      return res.status(400).json({ error: 'Password must be 128 characters or fewer.' });
    }
    if (!/[a-zA-Z]/.test(password) || !/[0-9!@#$%^&*]/.test(password)) {
      return res.status(400).json({ error: 'Password must contain at least one letter and one number or special character.' });
    }

    const tokenHash = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const resetUser = await User.findOne({
      resetPasswordToken: tokenHash,
      resetPasswordExpires: { $gt: Date.now() }
    }).select('+resetPasswordToken +resetPasswordExpires');

    if (!resetUser) {
      return res.status(400).json({
        error:
          'Your token has expired. Please attempt to reset your password again.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    resetUser.password = hash;
    resetUser.resetPasswordToken = undefined;
    resetUser.resetPasswordExpires = undefined;
    resetUser.jwtSeed = (resetUser.jwtSeed || 1) + 1;

    await resetUser.save();

    try {
      await smtp.sendEmail(resetUser.email, 'reset-confirmation');
    } catch (emailError) {
      console.warn('Reset confirmation email failed to send:', emailError.message);
    }

    res.status(200).json({
      success: true,
      message:
        'Password changed successfully. Please login with your new password.'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

router.post('/reset', auth, async (req, res) => {
  try {
    const { password, confirmPassword } = req.body;
    const email = req.user.email;

    if (!email) {
      return res.status(401).send('Unauthenticated');
    }

    if (!password) {
      return res.status(400).json({ error: 'You must enter a password.' });
    }

    if (!confirmPassword) {
      return res.status(400).json({ error: 'You must confirm your new password.' });
    }

    if (confirmPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters.' });
    }

    if (confirmPassword.length > 128) {
      return res.status(400).json({ error: 'New password must be 128 characters or fewer.' });
    }

    if (!/[a-zA-Z]/.test(confirmPassword) || !/[0-9!@#$%^&*]/.test(confirmPassword)) {
      return res.status(400).json({ error: 'New password must contain at least one letter and one number or special character.' });
    }

    const existingUser = await User.findOne({ email }).select('+password');
    if (!existingUser) {
      return res
        .status(400)
        .json({ error: 'No user found for this email address.' });
    }

    const isMatch = await bcrypt.compare(password, existingUser.password);

    if (!isMatch) {
      return res
        .status(400)
        .json({ error: 'Please enter your correct old password.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(confirmPassword, salt);
    existingUser.password = hash;
    existingUser.jwtSeed = (existingUser.jwtSeed || 1) + 1;
    await existingUser.save();

    try {
      await smtp.sendEmail(existingUser.email, 'reset-confirmation');
    } catch (emailError) {
      console.warn('Reset confirmation email failed to send:', emailError.message);
    }

    res.status(200).json({
      success: true,
      message:
        'Password changed successfully. Please login with your new password.'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

router.get(
  '/google',
  passport.authenticate('google', {
    session: false,
    scope: ['profile', 'email'],
    accessType: 'offline',
    approvalPrompt: 'force'
  })
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${keys.app.clientURL}/login`,
    session: false
  }),
  (req, res) => {
    const payload = {
      id: req.user.id,
      jwtSeed: req.user.jwtSeed
    };

    const token = jwt.sign(payload, secret, { expiresIn: tokenLife });
    const jwtToken = `Bearer ${token}`;
    res.cookie('token', jwtToken, {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      httpOnly: true,         // Not accessible by JS — prevents XSS theft
      secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
      sameSite: 'lax',        // Prevents CSRF on the OAuth redirect flow
      path: '/'
    });
    res.redirect(`${keys.app.clientURL}/auth/success`);
  }
);



const getCookieFromHeaders = (cookieHeader, name) => {
  if (!cookieHeader) return null;
  const value = `; ${cookieHeader}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

router.get('/google/success', (req, res) => {
  const cookieHeader = req.headers.cookie;
  const token = getCookieFromHeaders(cookieHeader, 'token');
  if (!token) {
    return res.status(401).json({ error: 'Authentication token not found.' });
  }

  return res.status(200).json({
    success: true,
    token: decodeURIComponent(token)
  });
});

router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  });
  res.status(200).json({
    success: true,
    message: 'Logged out successfully.'
  });
});

module.exports = router;
