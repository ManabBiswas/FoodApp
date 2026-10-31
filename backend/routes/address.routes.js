import express from 'express';
import Address from '../models/Address.model.js';
import { protect } from '../middleware/auth.js';
import { validateObjectId } from '../middleware/validateObjectId.js';
import handleControllerError from '../utils/controllerError.js';
import {
  isBoolean,
  isNonEmptyString,
  isPlainObject,
  pickFields,
} from '../utils/validation.js';

const router = express.Router();

const ADDRESS_FIELDS = [
  'label',
  'street',
  'city',
  'state',
  'zipCode',
  'country',
  'coordinates',
  'isDefault',
];

const LABELS = ['home', 'work', 'other'];

const validateAddressPayload = (payload, { partial = false } = {}) => {
  const has = (field) => payload[field] !== undefined;

  if (has('label') && !LABELS.includes(payload.label)) {
    return `Label must be one of: ${LABELS.join(', ')}`;
  }

  for (const field of ['street', 'city', 'state', 'zipCode', 'country']) {
    if (!partial || has(field)) {
      if (!isNonEmptyString(payload[field], 200)) {
        return `${field} is required and must be 200 characters or fewer`;
      }
    }
  }

  if (has('isDefault') && !isBoolean(payload.isDefault)) {
    return 'isDefault must be a boolean';
  }

  if (has('coordinates')) {
    if (!isPlainObject(payload.coordinates)) {
      return 'Coordinates must be an object';
    }

    const { latitude, longitude } = payload.coordinates;

    if (
      latitude !== undefined &&
      (!Number.isFinite(Number(latitude)) || Number(latitude) < -90 || Number(latitude) > 90)
    ) {
      return 'Latitude is invalid';
    }

    if (
      longitude !== undefined &&
      (!Number.isFinite(Number(longitude)) || Number(longitude) < -180 || Number(longitude) > 180)
    ) {
      return 'Longitude is invalid';
    }
  }

  return null;
};

// Get all addresses for user
router.get('/', protect, async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.user.id }).sort('-isDefault -createdAt');

    return res.status(200).json({
      status: 'success',
      results: addresses.length,
      data: addresses,
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
});

// Create new address
router.post('/', protect, async (req, res) => {
  try {
    // The authenticated user always owns the address. `req.body` is spread
    // first and then `user` is forced, so a client cannot override ownership.
    const payload = {
      ...pickFields(req.body, ADDRESS_FIELDS),
      user: req.user.id,
    };

    if (payload.country === undefined) {
      payload.country = 'India';
    }

    const validationError = validateAddressPayload(payload);

    if (validationError) {
      return res.status(400).json({
        status: 'error',
        message: validationError,
      });
    }

    const addressCount = await Address.countDocuments({ user: req.user.id });

    if (addressCount === 0) {
      payload.isDefault = true;
    }

    const address = await Address.create(payload);

    // If this is set as default, remove default from other addresses
    if (address.isDefault) {
      await Address.updateMany(
        { user: req.user.id, _id: { $ne: address._id } },
        { isDefault: false }
      );
    }

    return res.status(201).json({
      status: 'success',
      data: address,
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
});

// Update address
router.put('/:id', protect, validateObjectId('id'), async (req, res) => {
  try {
    const payload = pickFields(req.body, ADDRESS_FIELDS);

    if (Object.keys(payload).length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No valid fields provided',
      });
    }

    const validationError = validateAddressPayload(payload, { partial: true });

    if (validationError) {
      return res.status(400).json({
        status: 'error',
        message: validationError,
      });
    }

    // Scope the update to the owner so another user's address can never be
    // modified, even by guessing its id.
    const address = await Address.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!address) {
      return res.status(404).json({
        status: 'error',
        message: 'Address not found',
      });
    }

    Object.assign(address, payload);
    await address.save();

    // If this is set as default, remove default from other addresses
    if (address.isDefault) {
      await Address.updateMany(
        { user: req.user.id, _id: { $ne: address._id } },
        { isDefault: false }
      );
    }

    return res.status(200).json({
      status: 'success',
      data: address,
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
});

// Delete address
router.delete('/:id', protect, validateObjectId('id'), async (req, res) => {
  try {
    const address = await Address.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!address) {
      return res.status(404).json({
        status: 'error',
        message: 'Address not found',
      });
    }

    const wasDefault = address.isDefault;
    await address.deleteOne();

    // Keep exactly one default address when possible.
    if (wasDefault) {
      const replacement = await Address.findOne({ user: req.user.id }).sort(
        '-createdAt'
      );

      if (replacement) {
        replacement.isDefault = true;
        await replacement.save();
      }
    }

    return res.status(200).json({
      status: 'success',
      message: 'Address deleted successfully',
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
});

export default router;
