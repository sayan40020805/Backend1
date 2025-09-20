const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5003;

app.use(cors());
app.use(express.json());

// Mock data
let users = [];
let polls = [];
let userIdCounter = 1;
let pollIdCounter = 1;

const getUserFromToken = (token) => {
  if (!token) return null;
  const userId = parseInt(token.replace('mock-token-', ''));
  return users.find(u => u.id === userId);
};

// Auth routes
app.post('/api/auth/signup', (req, res) => {
  const { username, email, password } = req.body;
  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({ message: 'User already exists' });
  }
  const newUser = { id: userIdCounter++, username, email, password };
  newUser.token = 'mock-token-' + newUser.id;
  users.push(newUser);
  res.status(201).json({ user: { id: newUser.id, username, email }, token: newUser.token });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  res.json({ user: { id: user.id, username: user.username, email }, token: user.token });
});

// Poll routes
app.post('/api/polls', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'No token' });
  }
  const token = authHeader.replace('Bearer ', '');
  const user = getUserFromToken(token);
  if (!user) {
    return res.status(401).json({ message: 'Invalid token' });
  }
  const { question, options, isPublic } = req.body;
  const shareId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  const newPoll = {
    _id: pollIdCounter++,
    question,
    options: options.map((opt, idx) => ({ text: opt, votes: 0 })),
    isPublic: isPublic || false,
    creator: { _id: user.id, username: user.username },
    createdBy: user.id,
    createdAt: new Date(),
    shareId
  };
  polls.push(newPoll);
  res.status(201).json(newPoll);
});

app.get('/api/polls/my', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'No token' });
  }
  const token = authHeader.replace('Bearer ', '');
  const user = getUserFromToken(token);
  if (!user) {
    return res.status(401).json({ message: 'Invalid token' });
  }
  const userPolls = polls.filter(p => p.createdBy === user.id);
  res.json(userPolls);
});

app.get('/api/polls/:id', (req, res) => {
  const poll = polls.find(p => p._id == req.params.id);
  if (!poll) {
    return res.status(404).json({ message: 'Poll not found' });
  }
  res.json(poll);
});

app.post('/api/polls/:id/vote', (req, res) => {
  const { optionIndex } = req.body;
  const poll = polls.find(p => p._id == req.params.id);
  if (!poll) {
    return res.status(404).json({ message: 'Poll not found' });
  }
  if (optionIndex < 0 || optionIndex >= poll.options.length) {
    return res.status(400).json({ message: 'Invalid option' });
  }
  poll.options[optionIndex].votes++;
  res.json(poll);
});

// New endpoint to make poll public
app.put('/api/polls/:id/public', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'No token' });
  }
  const token = authHeader.replace('Bearer ', '');
  const user = getUserFromToken(token);
  if (!user) {
    return res.status(401).json({ message: 'Invalid token' });
  }
  const poll = polls.find(p => p._id == req.params.id);
  if (!poll) {
    return res.status(404).json({ message: 'Poll not found' });
  }
  if (poll.createdBy !== user.id) {
    return res.status(403).json({ message: 'Not authorized' });
  }
  poll.isPublic = true;
  res.json(poll);
});

// New endpoint to get share link
app.get('/api/polls/:id/share', (req, res) => {
  const poll = polls.find(p => p._id == req.params.id);
  if (!poll) {
    return res.status(404).json({ message: 'Poll not found' });
  }
  if (!poll.isPublic) {
    return res.status(403).json({ message: 'Poll is not public' });
  }

  // Use production URL if in production, otherwise use development URL
  const backendUrl = process.env.NODE_ENV === 'production'
    ? process.env.PRODUCTION_BACKEND_URL || `https://your-backend-domain.com:${PORT}`
    : `http://localhost:${PORT}`;

  const shareUrl = `${backendUrl}/api/polls/public/${poll.shareId}`;
  res.json({ shareUrl });
});

// New endpoint to get public poll by shareId
app.get('/api/polls/public/:shareId', (req, res) => {
  const poll = polls.find(p => p.shareId === req.params.shareId && p.isPublic);
  if (!poll) {
    return res.status(404).json({ message: 'Poll not found' });
  }
  res.json(poll);
});

app.listen(PORT, () => {
  console.log(`Mock backend server running on http://localhost:${PORT}`);
});
