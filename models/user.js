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
});

module.exports = mongoose.model('User', UserSchema);
