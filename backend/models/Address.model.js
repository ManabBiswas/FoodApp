const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  label: {
    type: String,
    enum: ['home', 'work', 'other'],
    default: 'home'
  },
  street: {
    type: String,
    required: [true, 'Please provide street address']
  },
  city: {
    type: String,
    required: [true, 'Please provide city']
  },
  state: {
    type: String,
    required: [true, 'Please provide state']
  },
  zipCode: {
    type: String,
    required: [true, 'Please provide zip code']
  },
  country: {
    type: String,
    required: [true, 'Please provide country'],
    default: 'India'
  },
  coordinates: {
    latitude: Number,
    longitude: Number
  },
  isDefault: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Address', addressSchema);
