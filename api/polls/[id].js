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

  // Set CORS headers
  Object.keys(corsHeaders).forEach(key => res.setHeader(key, corsHeaders[key]));

  try {
    

    const { id } = req.query;

    if (req.method === 'GET') {
      // Get poll by id
      const poll = Poll.findById(id);
      if (!poll) {
        return res.status(404).json({ message: 'Poll not found' });
      }
      res.json(poll);
    } else if (req.method === 'DELETE') {
      // Authenticate user
      const user = await auth(req);
      req.user = user;

      const poll = Poll.findById(id);
      if (!poll) {
        return res.status(404).json({ message: 'Poll not found' });
      }
      if (poll.creator !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to delete this poll' });
      }
      Poll.polls = Poll.polls.filter(p => p.id !== id);
      res.json({ message: 'Poll deleted' });
    } else {
      res.setHeader('Allow', 'GET, DELETE');
      res.status(405).end();
    }
  } catch (error) {
    if (error.message === 'Please authenticate') {
      res.status(401).json({ message: error.message });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
};
