import express from 'express';
import {
    cancelOrder,
    createOrder,
    getAllOrders,
    getMyOrders,
    getOrderById,
    updateOrderStatus
} from '../controllers/order.controller.js';
import { authorize, protect } from '../middleware/auth.js';
const router = express.Router();

router.route('/')
  .post(protect, createOrder)
  .get(protect, authorize('admin'), getAllOrders);

router.get('/my-orders', protect, getMyOrders);

router.route('/:id')
  .get(protect, getOrderById);

router.put('/:id/status', protect, authorize('admin'), updateOrderStatus);
router.put('/:id/cancel', protect, cancelOrder);

export default router;
