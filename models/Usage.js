// models/Usage.js
const mongoose = require('mongoose');

const UsageSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  count: {
    type: Number,
    default: 0,
  },
  lastAccessed: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Usage', UsageSchema);
