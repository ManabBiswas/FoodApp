import Food from '../models/Food.model.js';

// @desc    Get all food items
// @route   GET /api/food
// @access  Public
export const getAllFood = async (req, res) => {
  try {
    const { category, search, isVegetarian, maxPrice, minRating } = req.query;

    // Build query
    let query = { isAvailable: true };

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$text = { $search: search };
    }

    if (isVegetarian === 'true') {
      query.isVegetarian = true;
    }

    if (maxPrice) {
      query.price = { $lte: Number(maxPrice) };
    }

    if (minRating) {
      query.rating = { $gte: Number(minRating) };
    }

    const foods = await Food.find(query).sort('-createdAt');

    res.status(200).json({
      status: 'success',
      results: foods.length,
      data: foods
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Get single food item
// @route   GET /api/food/:id
// @access  Public
export const getFoodById = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({
        status: 'error',
        message: 'Food item not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: food
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Create food item
// @route   POST /api/food
// @access  Private/Admin
export const createFood = async (req, res) => {
  try {
    const food = await Food.create(req.body);

    res.status(201).json({
      status: 'success',
      data: food
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Update food item
// @route   PUT /api/food/:id
// @access  Private/Admin
export const updateFood = async (req, res) => {
  try {
    const food = await Food.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!food) {
      return res.status(404).json({
        status: 'error',
        message: 'Food item not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: food
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Delete food item
// @route   DELETE /api/food/:id
// @access  Private/Admin
export const deleteFood = async (req, res) => {
  try {
    const food = await Food.findByIdAndDelete(req.params.id);

    if (!food) {
      return res.status(404).json({
        status: 'error',
        message: 'Food item not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Food item deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Get food by category
// @route   GET /api/food/category/:category
// @access  Public
export const getFoodByCategory = async (req, res) => {
  try {
    const foods = await Food.find({ 
      category: req.params.category,
      isAvailable: true 
    }).sort('-rating');

    res.status(200).json({
      status: 'success',
      results: foods.length,
      data: foods
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};
