const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const academics = await User.find({ role: 'academics' }).select('-password').sort({ createdAt: -1 });
    res.json(academics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { name, email, password, department } = req.body;
    
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Don't hash here - let the model's pre-save middleware handle it
    const user = new User({
      name,
      email,
      password, // Plain password - will be hashed by User model's pre-save middleware
      role: 'academics',
      department,
      isVerified: true
    });
    await user.save();

    res.status(201).json({ message: 'Academics account created', user: { id: user._id, name: user.name, email: user.email, department: user.department } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const user = await User.findOneAndDelete({ _id: req.params.id, role: 'academics' });
    if (!user) {
      return res.status(404).json({ error: 'Academics not found' });
    }
    res.json({ message: 'Academics account deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;