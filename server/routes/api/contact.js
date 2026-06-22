const express = require('express');
const router = express.Router();

// Bring in Models & Helpers
const Contact = require('../../models/contact');
const User = require('../../models/user');
const smtp = require('../../services/smtp');
const auth = require('../../middleware/auth');
const role = require('../../middleware/role');
const { ROLES } = require('../../constants');

router.post('/add', async (req, res) => {
  try {
    const name = req.body.name;
    const email = req.body.email;
    const message = req.body.message;

    if (!email) {
      return res
        .status(400)
        .json({ error: 'You must enter an email address.' });
    }

    if (!name) {
      return res
        .status(400)
        .json({ error: 'You must enter description & name.' });
    }

    if (!message) {
      return res.status(400).json({ error: 'You must enter a message.' });
    }

    const existingContact = await Contact.findOne({ email });

    if (existingContact) {
      return res
        .status(400)
        .json({ error: 'A request already existed for same email address' });
    }

    const userDoc = await User.findOne({ email: { $regex: new RegExp('^' + email + '$', 'i') } });
    const userRole = userDoc ? userDoc.role : 'Guest';

    const contact = new Contact({
      name,
      email,
      message,
      userRole
    });

    const contactDoc = await contact.save();

    await smtp.sendEmail(email, 'contact');

    res.status(200).json({
      success: true,
      message: `We receved your message, we will reach you on your email address ${email}!`,
      contact: contactDoc
    });
  } catch (error) {
    return res.status(400).json({
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
    res.status(400).json({
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
    res.status(400).json({
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
    await smtp.sendEmail(contact.email, 'contact-reply', null, {
      reply: reply,
      message: contact.message
    });

    res.status(200).json({
      success: true,
      message: 'Solution sent successfully to user email!',
      contact: updatedContact
    });
  } catch (error) {
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

module.exports = router;
