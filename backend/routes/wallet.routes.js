import express from 'express';
import User from '../models/User.model.js';
import { protect } from '../middleware/auth.js';
import handleControllerError from '../utils/controllerError.js';
import {
  parseFiniteNumber,
  roundCurrency,
} from '../utils/validation.js';

const router = express.Router();

const MAX_TOP_UP = 50000;
const MAX_TRANSACTIONS = 100;
const HISTORY_LIMIT = 50;

const serializeTransactions = (transactions = []) =>
  [...transactions]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, HISTORY_LIMIT);

// @desc    Get wallet balance and recent transactions
// @route   GET /api/wallet
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      'walletBalance +walletTransactions'
    );

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    return res.status(200).json({
      status: 'success',
      data: {
        balance: roundCurrency(Number(user.walletBalance) || 0),
        transactions: serializeTransactions(user.walletTransactions),
      },
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
});

// @desc    Add demo money to the wallet
// @route   POST /api/wallet/topup
// @access  Private
//
// There is no payment gateway in this project yet, so this endpoint credits
// the wallet directly. Replace it with a gateway webhook before production.
router.post('/topup', protect, async (req, res) => {
  try {
    const amount = parseFiniteNumber(req.body?.amount);

    if (amount === null || amount <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Top-up amount must be greater than 0',
      });
    }

    const roundedAmount = roundCurrency(amount);

    if (roundedAmount <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Top-up amount must be at least ₹0.01',
      });
    }

    if (roundedAmount > MAX_TOP_UP) {
      return res.status(400).json({
        status: 'error',
        message: `A single top-up cannot exceed ₹${MAX_TOP_UP}`,
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        $inc: { walletBalance: roundedAmount },
        $push: {
          walletTransactions: {
            $each: [
              {
                type: 'credit',
                amount: roundedAmount,
                description: 'Wallet top-up (demo)',
                createdAt: new Date(),
              },
            ],
            $slice: -MAX_TRANSACTIONS,
          },
        },
      },
      { returnDocument: 'after', select: 'walletBalance +walletTransactions' }
    );

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    const transaction =
      user.walletTransactions?.[user.walletTransactions.length - 1] || null;

    return res.status(200).json({
      status: 'success',
      data: {
        balance: roundCurrency(Number(user.walletBalance) || 0),
        transaction,
      },
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
});

export default router;
