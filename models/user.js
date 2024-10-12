// models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  apiKey: {
    type: String,
    required: true,
    unique: true,
  },
  clientId: {
    type: String,
    required: true,
    unique: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  plan: {
    type: String,
    enum: ['basic', 'standard', 'premium', 'unlimited'],
    default: 'basic',
  },
  domains: {
    type: [String],
    required: true,
  },
  // Ensure there's no 'term' field here
});

module.exports = mongoose.model('User', UserSchema);
