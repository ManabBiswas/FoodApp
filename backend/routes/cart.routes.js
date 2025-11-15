import express from 'express';
import { protect } from '../middleware/auth.js';
// Cart controller will be created
import Cart from '../models/Cart.model.js';
const router = express.Router();

// Get user cart
router.get('/', protect, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id }).populate('items.food');
    
    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }

    res.status(200).json({
      status: 'success',
      data: cart
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Add item to cart
router.post('/add', protect, async (req, res) => {
  try {
    const { foodId, quantity, selectedToppings } = req.body;

    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }

    // Check if item already exists
    const itemIndex = cart.items.findIndex(
      item => item.food.toString() === foodId
    );

    if (itemIndex > -1) {
      // Update quantity
      cart.items[itemIndex].quantity += quantity || 1;
      if (selectedToppings) {
        cart.items[itemIndex].selectedToppings = selectedToppings;
      }
    } else {
      // Add new item
      cart.items.push({
        food: foodId,
        quantity: quantity || 1,
        selectedToppings: selectedToppings || []
      });
    }

    await cart.save();
    cart = await cart.populate('items.food');

    res.status(200).json({
      status: 'success',
      data: cart
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Update cart item
router.put('/update/:itemId', protect, async (req, res) => {
  try {
    const { quantity } = req.body;

    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({
        status: 'error',
        message: 'Cart not found'
      });
    }

    const item = cart.items.id(req.params.itemId);
    
    if (!item) {
      return res.status(404).json({
        status: 'error',
        message: 'Item not found in cart'
      });
    }

    item.quantity = quantity;
    await cart.save();

    res.status(200).json({
      status: 'success',
      data: cart
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Remove item from cart
router.delete('/remove/:itemId', protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({
        status: 'error',
        message: 'Cart not found'
      });
    }

    cart.items = cart.items.filter(
      item => item._id.toString() !== req.params.itemId
    );

    await cart.save();

    res.status(200).json({
      status: 'success',
      data: cart
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Clear cart
router.delete('/clear', protect, async (req, res) => {
  try {
    const cart = await Cart.findOneAndUpdate(
      { user: req.user.id },
      { items: [], totalItems: 0, subtotal: 0 },
      { new: true }
    );

    res.status(200).json({
      status: 'success',
      data: cart
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

export default router;
