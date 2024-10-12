// rateLimit.js
const rateLimit = require('express-rate-limit');
const User = require('../models/user'); // Import User model

// Create different rate limiters based on plan types
const rateLimits = {
  basic: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // Basic plan: 50 requests per 15 minutes
    keyGenerator: (req) => req.user.clientId,
    message: 'Basic plan limit exceeded, upgrade your plan for more requests.',
  }),
  standard: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Standard plan: 100 requests per 15 minutes
    keyGenerator: (req) => req.user.clientId, // Use clientId as the key
    message: 'Standard plan limit exceeded, upgrade your plan for more requests.',
  }),
  premium: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // Premium plan: 200 requests per 15 minutes
    keyGenerator: (req) => req.user.clientId,
    message: 'Premium plan limit exceeded, contact support for more access.',
  }),
  unlimited: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10000, // Admins or unlimited plans: Effectively no limit
    keyGenerator: (req) => req.user.clientId,
    message: 'Unexpected rate limit error for unlimited access.',
  }),
};

// Middleware function to apply rate limit based on user role and plan
const rateLimiter = async (req, res, next) => {
  try {
    // Extract user ID from request object
    const userId = req.user.id;

    // Fetch user data from the database
    const user = await User.findById(userId);

    // Check user role
    if (user.role === 'admin') {
      // Admins have unlimited access
      return rateLimits.unlimited(req, res, next);
    }

    // Check user's subscription plan and apply the corresponding rate limiter
    switch (user.plan) {
      case 'basic':
        return rateLimits.basic(req, res, next);
      case 'standard':
        return rateLimits.standard(req, res, next);
      case 'premium':
        return rateLimits.premium(req, res, next);
      default:
        // Default to basic if no plan is set
        return rateLimits.basic(req, res, next);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error: Unable to determine rate limit');
  }
};

module.exports = rateLimiter;
