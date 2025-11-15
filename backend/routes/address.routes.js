import express from 'express';
import { protect } from '../middleware/auth.js';
import Address from '../models/Address.model.js';
const router = express.Router();

// Get all addresses for user
router.get('/', protect, async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.user.id });

    res.status(200).json({
      status: 'success',
      results: addresses.length,
      data: addresses
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Create new address
router.post('/', protect, async (req, res) => {
  try {
    const address = await Address.create({
      user: req.user.id,
      ...req.body
    });

    // If this is set as default, remove default from other addresses
    if (address.isDefault) {
      await Address.updateMany(
        { user: req.user.id, _id: { $ne: address._id } },
        { isDefault: false }
      );
    }

    res.status(201).json({
      status: 'success',
      data: address
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Update address
router.put('/:id', protect, async (req, res) => {
  try {
    let address = await Address.findById(req.params.id);

    if (!address) {
      return res.status(404).json({
        status: 'error',
        message: 'Address not found'
      });
    }

    // Check ownership
    if (address.user.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized'
      });
    }

    address = await Address.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    // If this is set as default, remove default from other addresses
    if (address.isDefault) {
      await Address.updateMany(
        { user: req.user.id, _id: { $ne: address._id } },
        { isDefault: false }
      );
    }

    res.status(200).json({
      status: 'success',
      data: address
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Delete address
router.delete('/:id', protect, async (req, res) => {
  try {
    const address = await Address.findById(req.params.id);

    if (!address) {
      return res.status(404).json({
        status: 'error',
        message: 'Address not found'
      });
    }

    // Check ownership
    if (address.user.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized'
      });
    }

    await address.deleteOne();

    res.status(200).json({
      status: 'success',
      message: 'Address deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

export default router;
