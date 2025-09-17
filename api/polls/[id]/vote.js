const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Poll = require('../../../models/Poll');
const User = require('../../../models/User');

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

    const { id } = req.query;
    const { optionIndex } = req.body;
    const poll = await Poll.findById(id);
    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    // Check if user already voted
    const alreadyVoted = poll.voters.some(voter => voter.user && voter.user.toString() === req.user._id.toString());
    if (alreadyVoted) {
      return res.status(400).json({ message: 'You have already voted' });
    }

    // Increment vote
    poll.options[optionIndex].votes += 1;

    // Record voter
    poll.voters.push({ user: req.user._id, optionIndex });

    await poll.save();

    // Note: Socket.io removed, no real-time update

    res.json(poll);
  } catch (error) {
    if (error.message === 'Please authenticate') {
      res.status(401).json({ message: error.message });
    } else {
      res.status(400).json({ message: error.message });
    }
  }
};
