const express = require('express');
const router = express.Router();

const smtp = require('../../services/smtp');

router.post('/subscribe', async (req, res) => {
  const email = req.body.email;

  if (!email) {
    return res.status(400).json({ error: 'You must enter an email address.' });
  }

  await smtp.sendEmail(email, 'newsletter-subscription');

  res.status(200).json({
    success: true,
    message: 'You have successfully subscribed to the newsletter'
  });
});

module.exports = router;
