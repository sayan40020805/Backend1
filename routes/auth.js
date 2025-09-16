const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Signup
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if username already exists
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const user = new User({ username, email, password });
    await user.save();
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.status(201).json({ user: { id: user._id, username, email }, token });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for:', email);
    const user = await User.findOne({ email });
    console.log('User found:', !!user);
    if (!user || !(await user.comparePassword(password))) {
      console.log('Invalid credentials');
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    console.log('Login successful, token generated');
    res.json({ user: { id: user._id, username: user.username, email }, token });
  } catch (error) {
    console.log('Login error:', error.message);
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
