const express = require('express');
const router = express.Router();

const Newsletter = require('../../models/newsletter');
const smtp = require('../../services/smtp');
const rateLimiter = require('../../middleware/rateLimiter');
const validator = require('validator');

const newsletterLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many subscription attempts, please try again later.'
});

router.post('/subscribe', newsletterLimiter, async (req, res) => {
  try {
    const email = req.body.email;

    if (!email || !validator.isEmail(String(email))) {
      return res.status(400).json({ error: 'You must enter a valid email address.' });
    }

    const emailLower = email.trim().toLowerCase();

    // Check if already subscribed
    const existingSubscription = await Newsletter.findOne({ email: emailLower });
    if (existingSubscription) {
      return res.status(400).json({ error: 'You are already subscribed to the newsletter.' });
    }

    const subscription = new Newsletter({ email: emailLower });
    await subscription.save();

    try {
      await smtp.sendEmail(emailLower, 'newsletter-subscription');
    } catch (emailError) {
      console.warn('Newsletter subscription email failed to send:', emailError.message);
    }

    res.status(200).json({
      success: true,
      message: 'You have successfully subscribed to the newsletter'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

router.post('/unsubscribe', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !validator.isEmail(String(email))) {
      return res.status(400).json({ error: 'You must enter a valid email address.' });
    }

    const emailLower = email.trim().toLowerCase();

    await Newsletter.deleteOne({ email: emailLower });

    res.status(200).json({
      success: true,
      message: 'You have successfully unsubscribed from the newsletter.'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

module.exports = router;
