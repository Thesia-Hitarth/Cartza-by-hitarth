const express = require('express');
const router = express.Router();

// Bring in Models & Helpers
const Address = require('../../models/address');
const auth = require('../../middleware/auth');

// add address api
router.post('/add', auth, async (req, res) => {
  try {
    const user = req.user;

    const address = new Address({
      ...req.body,
      user: user._id
    });
    const addressDoc = await address.save();

    res.status(200).json({
      success: true,
      message: `Address has been added successfully!`,
      address: addressDoc
    });
  } catch (error) {
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

// fetch all addresses api
router.get('/', auth, async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.user._id });

    res.status(200).json({
      addresses
    });
  } catch (error) {
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const addressId = req.params.id;

    const addressDoc = await Address.findOne({ _id: addressId, user: req.user._id });

    if (!addressDoc) {
      return res.status(404).json({
        message: `Cannot find Address with the id: ${addressId}.`
      });
    }

    res.status(200).json({
      address: addressDoc
    });
  } catch (error) {
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const addressId = req.params.id;
    const update = req.body;
    const query = { _id: addressId, user: req.user._id };

    const addressDoc = await Address.findOneAndUpdate(query, update, {
      new: true
    });

    if (!addressDoc) {
      return res.status(404).json({ error: 'Address not found or unauthorized.' });
    }

    res.status(200).json({
      success: true,
      message: 'Address has been updated successfully!'
    });
  } catch (error) {
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

router.delete('/delete/:id', auth, async (req, res) => {
  try {
    const addressId = req.params.id;
    const addressDoc = await Address.findOne({ _id: addressId, user: req.user._id });
    if (!addressDoc) {
      return res.status(404).json({ error: 'Address not found or unauthorized.' });
    }
    const address = await Address.deleteOne({ _id: addressId });

    res.status(200).json({
      success: true,
      message: `Address has been deleted successfully!`,
      address
    });
  } catch (error) {
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

module.exports = router;
