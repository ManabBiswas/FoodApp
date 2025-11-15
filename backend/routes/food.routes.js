import express from 'express';
import {
    createFood,
    deleteFood,
    getAllFood,
    getFoodByCategory,
    getFoodById,
    updateFood
} from '../controllers/food.controller.js';
import { authorize, protect } from '../middleware/auth.js';
const router = express.Router();

router.route('/')
  .get(getAllFood)
  .post(protect, authorize('admin'), createFood);

router.route('/:id')
  .get(getFoodById)
  .put(protect, authorize('admin'), updateFood)
  .delete(protect, authorize('admin'), deleteFood);

router.get('/category/:category', getFoodByCategory);

export default router;
