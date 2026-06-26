const express = require('express');
const router = express.Router();

// Bring in Models & Helpers
const Address = require('../../models/address');
const auth = require('../../middleware/auth');

const Mongoose = require('mongoose');

// add address api
router.post('/add', auth, async (req, res) => {
  try {
    const user = req.user;
    const { address, city, state, country, zipCode, isDefault } = req.body;

    if (!address || typeof address !== 'string' || !address.trim()) {
      return res.status(400).json({ error: 'Address is required.' });
    }
    if (!city || typeof city !== 'string' || !city.trim()) {
      return res.status(400).json({ error: 'City is required.' });
    }
    if (!state || typeof state !== 'string' || !state.trim()) {
      return res.status(400).json({ error: 'State is required.' });
    }
    if (!country || typeof country !== 'string' || !country.trim()) {
      return res.status(400).json({ error: 'Country is required.' });
    }
    if (!zipCode || typeof zipCode !== 'string' || !zipCode.trim()) {
      return res.status(400).json({ error: 'Zip Code is required.' });
    }
    const cleanZip = zipCode.trim().toUpperCase();
    if (!/^[A-Z0-9]{3,10}(-[A-Z0-9]{3,6})?$/.test(cleanZip)) {
      return res.status(400).json({ error: 'Please enter a valid zip / postal code.' });
    }

    const newAddress = new Address({
      address: address.trim(),
      city: city.trim(),
      state: state.trim(),
      country: country.trim(),
      zipCode: zipCode.trim(),
      isDefault: Boolean(isDefault),
      user: user._id
    });
    const addressDoc = await newAddress.save();

    res.status(200).json({
      success: true,
      message: `Address has been added successfully!`,
      address: addressDoc
    });
  } catch (error) {
    res.status(500).json({
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
    res.status(500).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const addressId = req.params.id;
    if (!Mongoose.Types.ObjectId.isValid(addressId)) {
      return res.status(400).json({ error: 'Invalid Address ID.' });
    }

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
    res.status(500).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const addressId = req.params.id;
    if (!Mongoose.Types.ObjectId.isValid(addressId)) {
      return res.status(400).json({ error: 'Invalid Address ID.' });
    }

    const { address, city, state, country, zipCode, isDefault } = req.body;
    const update = {};

    if (address !== undefined) {
      if (typeof address !== 'string' || !address.trim()) {
        return res.status(400).json({ error: 'Address cannot be empty.' });
      }
      update.address = address.trim();
    }
    if (city !== undefined) {
      if (typeof city !== 'string' || !city.trim()) {
        return res.status(400).json({ error: 'City cannot be empty.' });
      }
      update.city = city.trim();
    }
    if (state !== undefined) {
      if (typeof state !== 'string' || !state.trim()) {
        return res.status(400).json({ error: 'State cannot be empty.' });
      }
      update.state = state.trim();
    }
    if (country !== undefined) {
      if (typeof country !== 'string' || !country.trim()) {
        return res.status(400).json({ error: 'Country cannot be empty.' });
      }
      update.country = country.trim();
    }
    if (zipCode !== undefined) {
      if (typeof zipCode !== 'string' || !zipCode.trim()) {
        return res.status(400).json({ error: 'Zip Code cannot be empty.' });
      }
      update.zipCode = zipCode.trim();
    }
    if (isDefault !== undefined) {
      update.isDefault = Boolean(isDefault);
    }
    update.updated = Date.now();

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
    res.status(500).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

router.delete('/delete/:id', auth, async (req, res) => {
  try {
    const addressId = req.params.id;
    if (!Mongoose.Types.ObjectId.isValid(addressId)) {
      return res.status(400).json({ error: 'Invalid Address ID.' });
    }

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
    res.status(500).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

module.exports = router;
