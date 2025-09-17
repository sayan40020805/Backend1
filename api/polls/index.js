const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Poll = require('../../models/Poll');
const User = require('../../models/User');

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Auth middleware function
const auth = async (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Please authenticate');
  }
  const token = authHeader.replace('Bearer ', '');
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);
  if (!user) {
    throw new Error('Please authenticate');
  }
  return user;
};

module.exports = async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.status(200).end();
    return;
  }

  // Only allow POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).end();
    return;
  }

  // Set CORS headers
  Object.keys(corsHeaders).forEach(key => res.setHeader(key, corsHeaders[key]));

  try {
    // Connect to MongoDB if not connected
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    }

    // Authenticate user
    const user = await auth(req);
    req.user = user;

    const { question, options, isPublic } = req.body;
    const poll = new Poll({
      question,
      options: options.map(text => ({ text, votes: 0 })),
      creator: req.user._id,
      isPublic: isPublic || false,
    });
    await poll.save();
    res.status(201).json(poll);
  } catch (error) {
    if (error.message === 'Please authenticate') {
      res.status(401).json({ message: error.message });
    } else {
      res.status(400).json({ message: error.message });
    }
  }
};
