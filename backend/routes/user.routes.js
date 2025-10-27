const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User.model');

// Get user profile
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      status: 'success',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Update user profile
router.put('/profile', protect, async (req, res) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      avatar: req.body.avatar
    };

    const user = await User.findByIdAndUpdate(
      req.user.id,
      fieldsToUpdate,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Add/Remove favorite
router.put('/favorites/:foodId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    const index = user.favoriteItems.indexOf(req.params.foodId);

    if (index > -1) {
      // Remove from favorites
      user.favoriteItems.splice(index, 1);
    } else {
      // Add to favorites
      user.favoriteItems.push(req.params.foodId);
    }

    await user.save();

    res.status(200).json({
      status: 'success',
      data: user.favoriteItems
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Get user favorites
router.get('/favorites', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('favoriteItems');

    res.status(200).json({
      status: 'success',
      data: user.favoriteItems
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

module.exports = router;
