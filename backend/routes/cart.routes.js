import express from 'express';
import Food from '../models/Food.model.js';
import Cart from '../models/Cart.model.js';
import { protect } from '../middleware/auth.js';
import { validateObjectId } from '../middleware/validateObjectId.js';
import handleControllerError from '../utils/controllerError.js';
import resolveToppings from '../utils/toppings.js';
import {
  isObjectId,
  parsePositiveInt,
  roundCurrency,
} from '../utils/validation.js';

const router = express.Router();

const MAX_ITEM_QUANTITY = 50;

const getOrCreateCart = async (userId) => {
  const existing = await Cart.findOne({ user: userId });

  if (existing) {
    return existing;
  }

  try {
    return await Cart.create({ user: userId, items: [] });
  } catch (error) {
    // Two concurrent requests can both try to create the cart. The unique
    // index on `user` rejects one of them, so load the winning document.
    if (error?.code === 11000) {
      return Cart.findOne({ user: userId });
    }

    throw error;
  }
};

const toppingsSignature = (toppings = []) =>
  toppings
    .map((topping) => `${topping.name}:${Number(topping.price) || 0}`)
    .sort()
    .join('|');

const computeTotals = (cart) => {
  const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = cart.items.reduce((sum, item) => {
    const basePrice = Number(item.food?.price) || 0;
    const toppingsPrice = (item.selectedToppings || []).reduce(
      (topSum, topping) => topSum + (Number(topping.price) || 0),
      0
    );

    return sum + (basePrice + toppingsPrice) * item.quantity;
  }, 0);

  return { totalItems, subtotal: roundCurrency(subtotal) };
};

// Keep the cached totals stored on the cart in sync with the populated items.
const syncCartTotals = async (cart) => {
  const { totalItems, subtotal } = computeTotals(cart);

  if (cart.totalItems !== totalItems || cart.subtotal !== subtotal) {
    await Cart.updateOne({ _id: cart._id }, { totalItems, subtotal });
    cart.totalItems = totalItems;
    cart.subtotal = subtotal;
  }

  return cart;
};

const sendCart = (res, cart) =>
  res.status(200).json({
    status: 'success',
    data: cart,
  });

// Get user cart
const getCart = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user.id);

    await cart.populate('items.food');

    // Remove lines whose food item was deleted so totals stay meaningful.
    const staleItems = cart.items.filter((item) => !item.food);

    if (staleItems.length > 0) {
      for (const item of staleItems) {
        cart.items.pull(item._id);
      }

      await cart.save();
    }

    await syncCartTotals(cart);

    return sendCart(res, cart);
  } catch (error) {
    return handleControllerError(res, error);
  }
};

// Add item to cart
const addItem = async (req, res) => {
  try {
    const { foodId, quantity, selectedToppings } = req.body || {};

    if (!isObjectId(foodId)) {
      return res.status(400).json({
        status: 'error',
        message: 'A valid foodId is required',
      });
    }

    const parsedQuantity = parsePositiveInt(quantity ?? 1, MAX_ITEM_QUANTITY);

    if (!parsedQuantity) {
      return res.status(400).json({
        status: 'error',
        message: `Quantity must be a whole number between 1 and ${MAX_ITEM_QUANTITY}`,
      });
    }

    const food = await Food.findById(foodId);

    if (!food || !food.isAvailable) {
      return res.status(404).json({
        status: 'error',
        message: 'Food item is not available',
      });
    }

    const { toppings, error: toppingError } = resolveToppings(
      food,
      selectedToppings
    );

    if (toppingError) {
      return res.status(400).json({
        status: 'error',
        message: toppingError,
      });
    }

    const cart = await getOrCreateCart(req.user.id);

    // Check if the same food with the same toppings already exists.
    const itemIndex = cart.items.findIndex(
      (item) =>
        item.food.toString() === foodId &&
        toppingsSignature(item.selectedToppings) === toppingsSignature(toppings)
    );

    if (itemIndex > -1) {
      const item = cart.items[itemIndex];
      const nextQuantity = item.quantity + parsedQuantity;

      if (nextQuantity > MAX_ITEM_QUANTITY) {
        return res.status(400).json({
          status: 'error',
          message: `Quantity cannot exceed ${MAX_ITEM_QUANTITY} for a single item`,
        });
      }

      item.quantity = nextQuantity;

      if (selectedToppings !== undefined) {
        item.selectedToppings = toppings;
      }
    } else {
      cart.items.push({
        food: food._id,
        quantity: parsedQuantity,
        selectedToppings: toppings,
      });
    }

    await cart.save();
    await cart.populate('items.food');
    await syncCartTotals(cart);

    return sendCart(res, cart);
  } catch (error) {
    return handleControllerError(res, error);
  }
};

// Update cart item
const updateItem = async (req, res) => {
  try {
    const { quantity } = req.body || {};
    const parsedQuantity = parsePositiveInt(quantity, MAX_ITEM_QUANTITY);

    if (!parsedQuantity) {
      return res.status(400).json({
        status: 'error',
        message: `Quantity must be a whole number between 1 and ${MAX_ITEM_QUANTITY}`,
      });
    }

    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({
        status: 'error',
        message: 'Cart not found',
      });
    }

    const item = cart.items.id(req.params.itemId);

    if (!item) {
      return res.status(404).json({
        status: 'error',
        message: 'Item not found in cart',
      });
    }

    item.quantity = parsedQuantity;
    await cart.save();
    await cart.populate('items.food');
    await syncCartTotals(cart);

    return sendCart(res, cart);
  } catch (error) {
    return handleControllerError(res, error);
  }
};

// Remove item from cart
const removeItem = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({
        status: 'error',
        message: 'Cart not found',
      });
    }

    const item = cart.items.id(req.params.itemId);

    if (!item) {
      return res.status(404).json({
        status: 'error',
        message: 'Item not found in cart',
      });
    }

    cart.items.pull(item._id);
    await cart.save();
    await cart.populate('items.food');
    await syncCartTotals(cart);

    return sendCart(res, cart);
  } catch (error) {
    return handleControllerError(res, error);
  }
};

// Clear cart
const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOneAndUpdate(
      { user: req.user.id },
      { items: [], totalItems: 0, subtotal: 0 },
      {
        returnDocument: 'after',
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    await cart.populate('items.food');

    return sendCart(res, cart);
  } catch (error) {
    return handleControllerError(res, error);
  }
};

// Documented REST paths
router.get('/', protect, getCart);
router.post('/items', protect, addItem);
router.put('/items/:itemId', protect, validateObjectId('itemId'), updateItem);
router.delete('/items/:itemId', protect, validateObjectId('itemId'), removeItem);
router.delete('/', protect, clearCart);

// Legacy aliases (kept for compatibility)
router.post('/add', protect, addItem);
router.put('/update/:itemId', protect, validateObjectId('itemId'), updateItem);
router.delete('/remove/:itemId', protect, validateObjectId('itemId'), removeItem);
router.delete('/clear', protect, clearCart);

export default router;
