// routes/admin.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const User = require('../models/user');

// Get all users
router.get('/users', auth, authorize('admin'), async (req, res) => {
    try {
      const users = await User.find().select('-password -apiKey');
      res.json(users);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });

// Get user by ID
router.get('/users/:id', auth, authorize('admin'), async (req, res) => {
    try {
      const user = await User.findById(req.params.id).select('-password -apiKey');
      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }
      res.json(user);
    } catch (err) {
      console.error(err.message);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'User not found' });
      }
      res.status(500).send('Server Error');
    }
  });
  
  // Update user
  router.put('/users/:id', auth, authorize('admin'), async (req, res) => {
    const { name, email, role, plan } = req.body;
  
    const updateFields = {};
    if (name) updateFields.name = name;
    if (email) updateFields.email = email;
    if (role) updateFields.role = role;
    if (plan) updateFields.plan = plan;
  
    try {
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { $set: updateFields },
        { new: true }
      ).select('-password -apiKey');
  
      res.json(user);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });
  
  // Delete user
  router.delete('/users/:id', auth, authorize('admin'), async (req, res) => {
    try {
      await User.findByIdAndRemove(req.params.id);
      res.json({ msg: 'User removed' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });


module.exports = router;