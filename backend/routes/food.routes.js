const express = require('express');
const router = express.Router();
const {
  getAllFood,
  getFoodById,
  createFood,
  updateFood,
  deleteFood,
  getFoodByCategory
} = require('../controllers/food.controller');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(getAllFood)
  .post(protect, authorize('admin'), createFood);

router.route('/:id')
  .get(getFoodById)
  .put(protect, authorize('admin'), updateFood)
  .delete(protect, authorize('admin'), deleteFood);

router.get('/category/:category', getFoodByCategory);

module.exports = router;
