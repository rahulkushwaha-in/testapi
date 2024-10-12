// get me route
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/user');
const Usage = require('../models/Usage')
const { v4: uuidv4 } = require('uuid');

// @route   GET /api/v1/users/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password -apiKey');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// put me route
// @route   PUT /api/v1/users/me
// @desc    Update current user
// @access  Private
router.put('/me', auth, async (req, res) => {
    if (!req.body.name || !req.body.email) {
        return res.status(400).json({ msg: "Name and email are required" })
    }

    // Get fields to update from request body
    const { name, email } = req.body;

    // Build update object
    const updateFields = {};
    if (name) updateFields.name = name;
    if (email) updateFields.email = email;

    try {
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: updateFields },
            { new: true }
        ).select('-password -apiKey');

        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// @route   POST /api/v1/users/api-key/renew
// @desc    Renew API key
// @access  Private

router.post('/api-key/renew', auth, async (req, res) => {
    if(!req.user.apiKey || !req.user){
        return res.status(400).json({
            msg: 'API key not found or invalid Please Login Again'
        })
    }
  try {
    const newApiKey = uuidv4();

    await User.findByIdAndUpdate(req.user.id, { apiKey: newApiKey });

    res.json({ apiKey: newApiKey });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

//upgrade and downgrade plans
// routes/users.js
// @routes   PUT /api/v1/users/plan
// @desc     Upgrade or downgrade user plan
// @access   Private
router.put('/plan', auth, async (req, res) => {
    const { plan } = req.body;
  
    if (!plan) {
      return res.status(400).json({ msg: 'Plan is required' });
    }
  
    const allowedPlans = ['basic', 'standard', 'premium'];
  
    if (!allowedPlans.includes(plan)) {
      return res.status(400).json({ msg: 'Invalid plan' });
    }
  
    try {
      await User.findByIdAndUpdate(req.user.id, { plan });
  
      res.json({ msg: `Plan updated to ${plan}` });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });
  

// usage of API for each term
// routes/users.js
//@route   GET /api/v1/users/usage
//@desc    Get user API usage
//@access  Private
router.get('/usage', auth, async (req, res) => {
    try {
      const usage = await Usage.findOne({ user: req.user.id });
      res.json(usage || { count: 0 });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error from catch');
    }
  });

module.exports = router;