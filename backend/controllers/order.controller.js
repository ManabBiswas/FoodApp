import Cart from '../models/Cart.model.js';
import Food from '../models/Food.model.js';
import Order from '../models/Order.model.js';
import handleControllerError from '../utils/controllerError.js';
import resolveToppings from '../utils/toppings.js';
import {
  isNonEmptyString,
  isObjectId,
  isPlainObject,
  parsePositiveInt,
  roundCurrency,
} from '../utils/validation.js';

const DELIVERY_FEE = 50;
const TAX_RATE = 0.05;
const MAX_ORDER_ITEMS = 100;
const MAX_ITEM_QUANTITY = 50;
const PAYMENT_METHODS = ['cash', 'card', 'upi', 'wallet'];
const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'preparing',
  'out-for-delivery',
  'delivered',
  'cancelled',
];

const validateDeliveryAddress = (address) => {
  if (!isPlainObject(address)) {
    return 'Delivery address is required';
  }

  for (const field of ['street', 'city', 'state', 'zipCode', 'country']) {
    if (!isNonEmptyString(address[field], 200)) {
      return `Delivery address ${field} is required`;
    }
  }

  if (address.coordinates !== undefined) {
    if (!isPlainObject(address.coordinates)) {
      return 'Delivery address coordinates must be an object';
    }

    const { latitude, longitude } = address.coordinates;

    if (
      latitude !== undefined &&
      (!Number.isFinite(Number(latitude)) || Number(latitude) < -90 || Number(latitude) > 90)
    ) {
      return 'Delivery address latitude is invalid';
    }

    if (
      longitude !== undefined &&
      (!Number.isFinite(Number(longitude)) || Number(longitude) < -180 || Number(longitude) > 180)
    ) {
      return 'Delivery address longitude is invalid';
    }
  }

  return null;
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res) => {
  try {
    const {
      orderItems,
      deliveryAddress,
      paymentMethod,
      specialInstructions,
    } = req.body || {};

    if (!Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No order items',
      });
    }

    if (orderItems.length > MAX_ORDER_ITEMS) {
      return res.status(400).json({
        status: 'error',
        message: `An order cannot contain more than ${MAX_ORDER_ITEMS} items`,
      });
    }

    const addressError = validateDeliveryAddress(deliveryAddress);

    if (addressError) {
      return res.status(400).json({
        status: 'error',
        message: addressError,
      });
    }

    if (!PAYMENT_METHODS.includes(paymentMethod)) {
      return res.status(400).json({
        status: 'error',
        message: `Payment method must be one of: ${PAYMENT_METHODS.join(', ')}`,
      });
    }

    if (
      specialInstructions !== undefined &&
      (typeof specialInstructions !== 'string' || specialInstructions.length > 500)
    ) {
      return res.status(400).json({
        status: 'error',
        message: 'Special instructions must be 500 characters or fewer',
      });
    }

    const requestedItems = [];

    for (const item of orderItems) {
      if (!isObjectId(item?.food)) {
        return res.status(400).json({
          status: 'error',
          message: 'Every order item must include a valid food id',
        });
      }

      const quantity = parsePositiveInt(item.quantity, MAX_ITEM_QUANTITY);

      if (!quantity) {
        return res.status(400).json({
          status: 'error',
          message: `Item quantity must be a whole number between 1 and ${MAX_ITEM_QUANTITY}`,
        });
      }

      requestedItems.push({
        foodId: item.food,
        quantity,
        selectedToppings: item.selectedToppings,
      });
    }

    // Prices, names, images, and topping prices always come from the database.
    // Client-supplied totals are ignored entirely.
    const foodIds = [...new Set(requestedItems.map((item) => item.foodId))];
    const foods = await Food.find({ _id: { $in: foodIds } });
    const foodMap = new Map(foods.map((food) => [food._id.toString(), food]));

    if (foodMap.size !== foodIds.length) {
      return res.status(400).json({
        status: 'error',
        message: 'One or more food items no longer exist',
      });
    }

    const orderItemsToCreate = [];
    let itemsPrice = 0;

    for (const requested of requestedItems) {
      const food = foodMap.get(requested.foodId);

      if (!food.isAvailable) {
        return res.status(400).json({
          status: 'error',
          message: `${food.name} is currently unavailable`,
        });
      }

      const { toppings, error: toppingError } = resolveToppings(
        food,
        requested.selectedToppings
      );

      if (toppingError) {
        return res.status(400).json({
          status: 'error',
          message: toppingError,
        });
      }

      const toppingsPrice = toppings.reduce(
        (sum, topping) => sum + (Number(topping.price) || 0),
        0
      );

      itemsPrice += (food.price + toppingsPrice) * requested.quantity;

      orderItemsToCreate.push({
        food: food._id,
        name: food.name,
        quantity: requested.quantity,
        price: food.price,
        image: food.image,
        selectedToppings: toppings,
      });
    }

    itemsPrice = roundCurrency(itemsPrice);
    const taxPrice = roundCurrency(itemsPrice * TAX_RATE);
    const deliveryFee = DELIVERY_FEE;
    const totalPrice = roundCurrency(itemsPrice + taxPrice + deliveryFee);

    const order = await Order.create({
      user: req.user.id,
      orderItems: orderItemsToCreate,
      deliveryAddress: {
        street: deliveryAddress.street.trim(),
        city: deliveryAddress.city.trim(),
        state: deliveryAddress.state.trim(),
        zipCode: deliveryAddress.zipCode.trim(),
        country: deliveryAddress.country.trim(),
        coordinates: deliveryAddress.coordinates,
      },
      paymentMethod,
      itemsPrice,
      taxPrice,
      deliveryFee,
      totalPrice,
      specialInstructions: specialInstructions?.trim() || undefined,
      deliveryTime: {
        estimatedTime: 30, // default 30 minutes
      },
    });

    // Clear user's cart after the order is created successfully
    await Cart.findOneAndUpdate(
      { user: req.user.id },
      { items: [], totalItems: 0, subtotal: 0 }
    );

    return res.status(201).json({
      status: 'success',
      data: order,
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

// @desc    Get user orders
// @route   GET /api/orders/my-orders
// @access  Private
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('orderItems.food', 'name image')
      .sort('-createdAt');

    return res.status(200).json({
      status: 'success',
      results: orders.length,
      data: orders,
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('orderItems.food');

    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found',
      });
    }

    const orderUserId = String(order.user?._id ?? order.user ?? '');
    const isOwner = orderUserId === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to access this order',
      });
    }

    return res.status(200).json({
      status: 'success',
      data: order,
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body || {};

    if (!ORDER_STATUSES.includes(orderStatus)) {
      return res.status(400).json({
        status: 'error',
        message: `Order status must be one of: ${ORDER_STATUSES.join(', ')}`,
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found',
      });
    }

    if (order.orderStatus === 'cancelled') {
      return res.status(400).json({
        status: 'error',
        message: 'Cancelled orders cannot be updated',
      });
    }

    order.orderStatus = orderStatus;

    if (orderStatus === 'delivered') {
      order.isDelivered = true;
      order.deliveredAt = new Date();
    } else if (order.isDelivered) {
      // Keep the delivery flag consistent if an admin corrects the status.
      order.isDelivered = false;
      order.deliveredAt = undefined;
    }

    await order.save();

    return res.status(200).json({
      status: 'success',
      data: order,
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
export const cancelOrder = async (req, res) => {
  try {
    const { cancelReason } = req.body || {};

    if (
      cancelReason !== undefined &&
      (typeof cancelReason !== 'string' || cancelReason.length > 500)
    ) {
      return res.status(400).json({
        status: 'error',
        message: 'Cancel reason must be 500 characters or fewer',
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found',
      });
    }

    const isOwner = order.user.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to cancel this order',
      });
    }

    if (order.orderStatus === 'cancelled') {
      return res.status(400).json({
        status: 'error',
        message: 'Order is already cancelled',
      });
    }

    // Can only cancel if order is pending or confirmed
    if (['preparing', 'out-for-delivery', 'delivered'].includes(order.orderStatus)) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot cancel order at this stage',
      });
    }

    order.orderStatus = 'cancelled';
    order.cancelReason = cancelReason?.trim() || undefined;

    if (order.isPaid) {
      order.paymentStatus = 'refunded';
    }

    await order.save();

    return res.status(200).json({
      status: 'success',
      data: order,
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .sort('-createdAt');

    return res.status(200).json({
      status: 'success',
      results: orders.length,
      data: orders,
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};
