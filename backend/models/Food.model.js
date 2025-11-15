import mongoose from 'mongoose';

const foodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide food name'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide description']
  },
  price: {
    type: Number,
    required: [true, 'Please provide price'],
    min: 0
  },
  category: {
    type: String,
    required: [true, 'Please provide category'],
    enum: ['Burger', 'Pizza', 'Wrap', 'Burrito', 'Sides', 'Drinks', 'Dessert']
  },
  image: {
    type: String,
    required: [true, 'Please provide image URL']
  },
  images: [{
    type: String
  }],
  isAvailable: {
    type: Boolean,
    default: true
  },
  preparationTime: {
    type: Number, // in minutes
    default: 20
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  numReviews: {
    type: Number,
    default: 0
  },
  nutritionInfo: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number
  },
  toppings: [{
    name: String,
    price: Number,
    image: String
  }],
  isVegetarian: {
    type: Boolean,
    default: false
  },
  isVegan: {
    type: Boolean,
    default: false
  },
  spicyLevel: {
    type: Number,
    min: 0,
    max: 3,
    default: 0
  }
}, {
  timestamps: true
});

// Index for search optimization
foodSchema.index({ name: 'text', description: 'text' });

export default mongoose.model('Food', foodSchema);
