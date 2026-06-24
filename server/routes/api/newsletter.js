const express = require('express');
const router = express.Router();

const Newsletter = require('../../models/newsletter');
const smtp = require('../../services/smtp');

router.post('/subscribe', async (req, res) => {
  try {
    const email = req.body.email;

    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({ error: 'You must enter an email address.' });
    }

    const emailLower = email.trim().toLowerCase();

    // Check if already subscribed
    const existingSubscription = await Newsletter.findOne({ email: emailLower });
    if (existingSubscription) {
      return res.status(400).json({ error: 'You are already subscribed to the newsletter.' });
    }

    const subscription = new Newsletter({ email: emailLower });
    await subscription.save();

    await smtp.sendEmail(emailLower, 'newsletter-subscription');

    res.status(200).json({
      success: true,
      message: 'You have successfully subscribed to the newsletter'
    });
  } catch (error) {
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

module.exports = router;
