import Food from '../models/Food.model.js';
import handleControllerError from '../utils/controllerError.js';
import {
  isNonEmptyString,
  isPlainObject,
  parseFiniteNumber,
  pickFields,
} from '../utils/validation.js';

const FOOD_CATEGORIES = [
  'Burger',
  'Pizza',
  'Wrap',
  'Burrito',
  'Sides',
  'Drinks',
  'Dessert',
];

const FOOD_FIELDS = [
  'name',
  'description',
  'price',
  'category',
  'image',
  'images',
  'isAvailable',
  'preparationTime',
  'rating',
  'numReviews',
  'nutritionInfo',
  'toppings',
  'isVegetarian',
  'isVegan',
  'spicyLevel',
];

const MAX_RESULTS = 200;

const validateFoodPayload = (payload, { partial = false } = {}) => {
  const has = (field) => payload[field] !== undefined;

  if (!partial || has('name')) {
    if (!isNonEmptyString(payload.name, 100)) {
      return 'Food name is required and must be 100 characters or fewer';
    }
  }

  if (!partial || has('description')) {
    if (!isNonEmptyString(payload.description, 1000)) {
      return 'Description is required and must be 1000 characters or fewer';
    }
  }

  if (!partial || has('price')) {
    const price = parseFiniteNumber(payload.price);

    if (price === null || price < 0) {
      return 'Price must be a non-negative number';
    }

    payload.price = price;
  }

  if (!partial || has('category')) {
    if (!FOOD_CATEGORIES.includes(payload.category)) {
      return `Category must be one of: ${FOOD_CATEGORIES.join(', ')}`;
    }
  }

  if (!partial || has('image')) {
    if (!isNonEmptyString(payload.image, 500)) {
      return 'Image URL is required and must be 500 characters or fewer';
    }
  }

  if (has('images')) {
    if (!Array.isArray(payload.images)) {
      return 'Images must be an array of URLs';
    }

    for (const image of payload.images) {
      if (!isNonEmptyString(image, 500)) {
        return 'Each image must be a URL of 500 characters or fewer';
      }
    }
  }

  if (has('preparationTime')) {
    const preparationTime = parseFiniteNumber(payload.preparationTime);

    if (preparationTime === null || preparationTime < 0) {
      return 'Preparation time must be a non-negative number';
    }
  }

  if (has('rating')) {
    const rating = parseFiniteNumber(payload.rating);

    if (rating === null || rating < 0 || rating > 5) {
      return 'Rating must be between 0 and 5';
    }
  }

  if (has('spicyLevel')) {
    const spicyLevel = parseFiniteNumber(payload.spicyLevel);

    if (spicyLevel === null || spicyLevel < 0 || spicyLevel > 3) {
      return 'Spicy level must be between 0 and 3';
    }
  }

  if (has('isAvailable') && typeof payload.isAvailable !== 'boolean') {
    return 'isAvailable must be a boolean';
  }

  if (has('isVegetarian') && typeof payload.isVegetarian !== 'boolean') {
    return 'isVegetarian must be a boolean';
  }

  if (has('isVegan') && typeof payload.isVegan !== 'boolean') {
    return 'isVegan must be a boolean';
  }

  if (has('nutritionInfo') && !isPlainObject(payload.nutritionInfo)) {
    return 'nutritionInfo must be an object';
  }

  if (has('toppings')) {
    if (!Array.isArray(payload.toppings)) {
      return 'Toppings must be an array';
    }

    for (const topping of payload.toppings) {
      if (!isPlainObject(topping) || !isNonEmptyString(topping.name, 100)) {
        return 'Each topping must include a name';
      }

      const price = parseFiniteNumber(topping.price ?? 0);

      if (price === null || price < 0) {
        return 'Topping price must be a non-negative number';
      }
    }
  }

  return null;
};

// @desc    Get all food items
// @route   GET /api/foods
// @access  Public
export const getAllFood = async (req, res) => {
  try {
    const { category, search, isVegetarian, maxPrice, minRating } = req.query;

    // Build query
    const query = { isAvailable: true };

    if (category !== undefined) {
      if (!FOOD_CATEGORIES.includes(category)) {
        return res.status(400).json({
          status: 'error',
          message: `Category must be one of: ${FOOD_CATEGORIES.join(', ')}`,
        });
      }

      query.category = category;
    }

    if (search !== undefined) {
      if (typeof search !== 'string' || search.trim().length === 0 || search.length > 100) {
        return res.status(400).json({
          status: 'error',
          message: 'Search must be between 1 and 100 characters',
        });
      }

      query.$text = { $search: search.trim() };
    }

    if (isVegetarian !== undefined) {
      if (!['true', 'false'].includes(isVegetarian)) {
        return res.status(400).json({
          status: 'error',
          message: 'isVegetarian must be true or false',
        });
      }

      if (isVegetarian === 'true') {
        query.isVegetarian = true;
      }
    }

    if (maxPrice !== undefined) {
      const parsedMaxPrice = parseFiniteNumber(maxPrice);

      if (parsedMaxPrice === null || parsedMaxPrice < 0) {
        return res.status(400).json({
          status: 'error',
          message: 'maxPrice must be a non-negative number',
        });
      }

      query.price = { $lte: parsedMaxPrice };
    }

    if (minRating !== undefined) {
      const parsedMinRating = parseFiniteNumber(minRating);

      if (parsedMinRating === null || parsedMinRating < 0 || parsedMinRating > 5) {
        return res.status(400).json({
          status: 'error',
          message: 'minRating must be between 0 and 5',
        });
      }

      query.rating = { $gte: parsedMinRating };
    }

    const foods = await Food.find(query).sort('-createdAt').limit(MAX_RESULTS);

    return res.status(200).json({
      status: 'success',
      results: foods.length,
      data: foods,
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

// @desc    Get single food item
// @route   GET /api/foods/:id
// @access  Public
export const getFoodById = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({
        status: 'error',
        message: 'Food item not found',
      });
    }

    return res.status(200).json({
      status: 'success',
      data: food,
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

// @desc    Create food item
// @route   POST /api/foods
// @access  Private/Admin
export const createFood = async (req, res) => {
  try {
    const payload = pickFields(req.body, FOOD_FIELDS);
    const validationError = validateFoodPayload(payload);

    if (validationError) {
      return res.status(400).json({
        status: 'error',
        message: validationError,
      });
    }

    const food = await Food.create(payload);

    return res.status(201).json({
      status: 'success',
      data: food,
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

// @desc    Update food item
// @route   PUT /api/foods/:id
// @access  Private/Admin
export const updateFood = async (req, res) => {
  try {
    const payload = pickFields(req.body, FOOD_FIELDS);

    if (Object.keys(payload).length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No valid fields provided',
      });
    }

    const validationError = validateFoodPayload(payload, { partial: true });

    if (validationError) {
      return res.status(400).json({
        status: 'error',
        message: validationError,
      });
    }

    const food = await Food.findByIdAndUpdate(req.params.id, payload, {
      returnDocument: 'after',
      runValidators: true,
    });

    if (!food) {
      return res.status(404).json({
        status: 'error',
        message: 'Food item not found',
      });
    }

    return res.status(200).json({
      status: 'success',
      data: food,
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

// @desc    Delete food item
// @route   DELETE /api/foods/:id
// @access  Private/Admin
export const deleteFood = async (req, res) => {
  try {
    const food = await Food.findByIdAndDelete(req.params.id);

    if (!food) {
      return res.status(404).json({
        status: 'error',
        message: 'Food item not found',
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Food item deleted successfully',
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

// @desc    Get food by category
// @route   GET /api/foods/category/:category
// @access  Public
export const getFoodByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    if (!FOOD_CATEGORIES.includes(category)) {
      return res.status(400).json({
        status: 'error',
        message: `Category must be one of: ${FOOD_CATEGORIES.join(', ')}`,
      });
    }

    const foods = await Food.find({
      category,
      isAvailable: true,
    }).sort('-rating');

    return res.status(200).json({
      status: 'success',
      results: foods.length,
      data: foods,
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};
