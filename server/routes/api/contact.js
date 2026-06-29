const express = require('express');
const router = express.Router();

// Bring in Models & Helpers
const Contact = require('../../models/contact');
const User = require('../../models/user');
const smtp = require('../../services/smtp');
const auth = require('../../middleware/auth');
const role = require('../../middleware/role');
const { ROLES } = require('../../constants');
const rateLimiter = require('../../middleware/rateLimiter');
const validator = require('validator');
const Mongoose = require('mongoose');

router.param('id', (req, res, next, id) => {
  if (!Mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid contact ID format.' });
  }
  next();
});

const contactLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many contact requests, please try again later.'
});

router.post('/add', contactLimiter, async (req, res) => {
  try {
    const name = req.body.name;
    const rawEmail = req.body.email;
    const message = req.body.message;

    if (!rawEmail || !validator.isEmail(String(rawEmail))) {
      return res
        .status(400)
        .json({ error: 'You must enter a valid email address.' });
    }

    const email = rawEmail.trim().toLowerCase();

    if (!name) {
      return res
        .status(400)
        .json({ error: 'You must enter your name.' });
    }

    if (!message) {
      return res.status(400).json({ error: 'You must enter a message.' });
    }

    const existingContact = await Contact.findOne({ email, status: 'Pending' });

    if (existingContact) {
      return res
        .status(400)
        .json({ error: 'A request already existed for same email address' });
    }

    const userDoc = await User.findOne({ email });
    const userRole = userDoc ? userDoc.role : 'Guest';

    const contact = new Contact({
      name,
      email,
      message,
      userRole
    });

    const contactDoc = await contact.save();

    try {
      await smtp.sendEmail(email, 'contact');
    } catch (emailError) {
      console.warn('Contact confirmation email failed to send:', emailError.message);
    }

    res.status(200).json({
      success: true,
      message: `We received your message, we will reach you at your email address ${email}!`,
      contact: contactDoc
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

// Fetch all contact submissions (Admin only)
router.get('/', auth, role.check(ROLES.Admin), async (req, res) => {
  try {
    const contacts = await Contact.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'email',
          foreignField: 'email',
          as: 'user'
        }
      },
      {
        $unwind: {
          path: '$user',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          message: 1,
          reply: 1,
          status: 1,
          created: 1,
          updated: 1,
          userRole: { $ifNull: ['$user.role', 'Guest'] }
        }
      },
      {
        $sort: { created: -1 }
      }
    ]);

    res.status(200).json({
      success: true,
      contacts
    });
  } catch (error) {
    res.status(500).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

// Fetch personal contact submissions (Customer / Merchant)
router.get('/me', auth, async (req, res) => {
  try {
    const email = req.user.email;
    const contacts = await Contact.find({ email }).sort({ created: -1 });
    res.status(200).json({
      success: true,
      contacts
    });
  } catch (error) {
    res.status(500).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

// Reply to contact submission (Admin only)
router.put('/reply/:id', auth, role.check(ROLES.Admin), async (req, res) => {
  try {
    const contactId = req.params.id;
    const { reply } = req.body;

    if (!reply) {
      return res.status(400).json({ error: 'You must enter a reply.' });
    }

    const contact = await Contact.findById(contactId);

    if (!contact) {
      return res.status(404).json({ error: 'Contact inquiry not found.' });
    }

    contact.reply = reply;
    contact.status = 'Resolved';
    contact.updated = Date.now();

    const updatedContact = await contact.save();

    // Trigger SMTP email sending
    try {
      await smtp.sendEmail(contact.email, 'contact-reply', null, {
        reply: reply,
        message: contact.message
      });
    } catch (emailError) {
      console.warn('Contact reply email failed to send:', emailError.message);
    }

    res.status(200).json({
      success: true,
      message: 'Solution sent successfully to user email!',
      contact: updatedContact
    });
  } catch (error) {
    res.status(500).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

module.exports = router;
