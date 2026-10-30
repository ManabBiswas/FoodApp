import express from 'express';
import {
  createFood,
  deleteFood,
  getAllFood,
  getFoodByCategory,
  getFoodById,
  updateFood,
} from '../controllers/food.controller.js';
import { authorize, protect } from '../middleware/auth.js';
import { validateObjectId } from '../middleware/validateObjectId.js';

const router = express.Router();

router.route('/')
  .get(getAllFood)
  .post(protect, authorize('admin'), createFood);

// Declared before /:id so the literal segment is unambiguous.
router.get('/category/:category', getFoodByCategory);

router.route('/:id')
  .get(validateObjectId('id'), getFoodById)
  .put(protect, authorize('admin'), validateObjectId('id'), updateFood)
  .delete(protect, authorize('admin'), validateObjectId('id'), deleteFood);

export default router;
