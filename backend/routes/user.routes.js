import express from 'express';
import Food from '../models/Food.model.js';
import User from '../models/User.model.js';
import { protect } from '../middleware/auth.js';
import { validateObjectId } from '../middleware/validateObjectId.js';
import handleControllerError from '../utils/controllerError.js';
import {
  isNonEmptyString,
  isValidEmail,
  isValidPhone,
  pickFields,
} from '../utils/validation.js';

const router = express.Router();

const PROFILE_FIELDS = ['name', 'email', 'phone', 'avatar'];

// Get user profile
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    return res.status(200).json({
      status: 'success',
      data: user,
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
});

// Update user profile
router.put('/profile', protect, async (req, res) => {
  try {
    const payload = pickFields(req.body, PROFILE_FIELDS);

    if (Object.keys(payload).length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No valid fields provided',
      });
    }

    if (payload.name !== undefined && !isNonEmptyString(payload.name, 50)) {
      return res.status(400).json({
        status: 'error',
        message: 'Name is required and must be 50 characters or fewer',
      });
    }

    if (payload.email !== undefined) {
      if (!isValidEmail(payload.email)) {
        return res.status(400).json({
          status: 'error',
          message: 'Please provide a valid email',
        });
      }

      payload.email = payload.email.trim().toLowerCase();
    }

    if (payload.phone !== undefined) {
      if (!isValidPhone(String(payload.phone))) {
        return res.status(400).json({
          status: 'error',
          message: 'Please provide a valid phone number (10-15 digits)',
        });
      }

      payload.phone = String(payload.phone).trim();
    }

    if (payload.name !== undefined) {
      payload.name = payload.name.trim();
    }

    if (payload.avatar !== undefined) {
      if (typeof payload.avatar !== 'string' || payload.avatar.length > 500) {
        return res.status(400).json({
          status: 'error',
          message: 'Avatar must be a URL of 500 characters or fewer',
        });
      }
    }

    const user = await User.findByIdAndUpdate(req.user.id, payload, {
      returnDocument: 'after',
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    return res.status(200).json({
      status: 'success',
      data: user,
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
});

// Add/Remove favorite
router.put(
  '/favorites/:foodId',
  protect,
  validateObjectId('foodId'),
  async (req, res) => {
    try {
      const { foodId } = req.params;
      const food = await Food.findById(foodId).select('_id');

      if (!food) {
        return res.status(404).json({
          status: 'error',
          message: 'Food item not found',
        });
      }

      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found',
        });
      }

      const isFavorite = user.favoriteItems.some(
        (item) => item.toString() === foodId
      );

      if (isFavorite) {
        await User.updateOne({ _id: user._id }, { $pull: { favoriteItems: foodId } });
      } else {
        await User.updateOne(
          { _id: user._id },
          { $addToSet: { favoriteItems: foodId } }
        );
      }

      const updatedUser = await User.findById(req.user.id).select('favoriteItems');

      return res.status(200).json({
        status: 'success',
        data: updatedUser.favoriteItems,
      });
    } catch (error) {
      return handleControllerError(res, error);
    }
  }
);

// Get user favorites
router.get('/favorites', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('favoriteItems');

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    return res.status(200).json({
      status: 'success',
      data: user.favoriteItems.filter(Boolean),
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
});

export default router;
