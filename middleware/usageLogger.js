// middleware/usageLogger.js
const Usage = require('../models/Usage');

module.exports = async (req, res, next) => {
  try {
    await Usage.findOneAndUpdate(
      { user: req.user.id },
      { $inc: { count: 1 } },
      { upsert: true }
    );
  } catch (err) {
    console.error(err.message);
  }
  next();
};
