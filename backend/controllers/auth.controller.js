import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';
import handleControllerError from '../utils/controllerError.js';
import {
  isNonEmptyString,
  isValidEmail,
  isValidPhone,
} from '../utils/validation.js';

const PASSWORD_MIN_LENGTH = 6;
// bcrypt only uses the first 72 bytes; reject longer input instead of silently
// truncating it.
const PASSWORD_MAX_LENGTH = 72;

// Generate JWT Token
const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
    algorithm: 'HS256',
  });
};

const buildAuthPayload = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  membershipType: user.membershipType,
  avatar: user.avatar,
  token: generateToken(user._id),
});

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body || {};

    if (!isNonEmptyString(name, 50)) {
      return res.status(400).json({
        status: 'error',
        message: 'Name is required and must be 50 characters or fewer',
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide a valid email',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone = String(phone ?? '').trim();

    if (!isValidPhone(normalizedPhone)) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide a valid phone number (10-15 digits)',
      });
    }

    if (
      typeof password !== 'string' ||
      password.length < PASSWORD_MIN_LENGTH ||
      password.length > PASSWORD_MAX_LENGTH
    ) {
      return res.status(400).json({
        status: 'error',
        message: `Password must be between ${PASSWORD_MIN_LENGTH} and ${PASSWORD_MAX_LENGTH} characters`,
      });
    }

    // Check if user exists
    const userExists = await User.findOne({
      $or: [{ email: normalizedEmail }, { phone: normalizedPhone }],
    });

    if (userExists) {
      return res.status(409).json({
        status: 'error',
        message: 'User already exists with this email or phone',
      });
    }

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: normalizedPhone,
      password,
    });

    return res.status(201).json({
      status: 'success',
      data: buildAuthPayload(user),
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    // Validate input
    if (!isValidEmail(email) || typeof password !== 'string' || password.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide email and password',
      });
    }

    // Check user exists
    const user = await User.findOne({ email: email.trim().toLowerCase() }).select(
      '+password'
    );

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials',
      });
    }

    // Check password
    const isPasswordMatch = await user.matchPassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials',
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        status: 'error',
        message: 'Your account has been deactivated',
      });
    }

    return res.status(200).json({
      status: 'success',
      data: buildAuthPayload(user),
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
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
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res) => {
  // In a stateless JWT system, logout is handled client-side by removing the
  // token. A server-side denylist would be needed for immediate revocation.
  return res.status(200).json({
    status: 'success',
    message: 'Logged out successfully',
  });
};
