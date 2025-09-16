const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    console.log('Auth header:', authHeader);
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No Bearer token');
      return res.status(401).json({ message: 'Please authenticate' });
    }
    const token = authHeader.replace('Bearer ', '');
    console.log('Token:', token);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded:', decoded);
    const user = await User.findById(decoded.id);
    if (!user) {
      console.log('User not found');
      throw new Error();
    }
    req.user = user;
    next();
  } catch (error) {
    console.log('Auth error:', error.message);
    res.status(401).json({ message: 'Please authenticate' });
  }
};

module.exports = auth;
