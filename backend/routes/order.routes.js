import express from 'express';
import {
  cancelOrder,
  createOrder,
  getAllOrders,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
} from '../controllers/order.controller.js';
import { authorize, protect } from '../middleware/auth.js';
import { validateObjectId } from '../middleware/validateObjectId.js';

const router = express.Router();

router.route('/')
  .post(protect, createOrder)
  .get(protect, authorize('admin'), getAllOrders);

router.get('/my-orders', protect, getMyOrders);

router.route('/:id')
  .get(protect, validateObjectId('id'), getOrderById);

router.put(
  '/:id/status',
  protect,
  authorize('admin'),
  validateObjectId('id'),
  updateOrderStatus
);
router.put(
  '/:id/cancel',
  protect,
  validateObjectId('id'),
  cancelOrder
);

export default router;
