const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      const allowedOrigins = process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(',')
        : ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5174"];

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5002;

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const allowedOrigins = process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',')
      : ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5174"];

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });

  socket.on('join-poll', (pollId) => {
    socket.join(`poll-${pollId}`);
    console.log(`User ${socket.id} joined poll ${pollId}`);
  });

  socket.on('leave-poll', (pollId) => {
    socket.leave(`poll-${pollId}`);
    console.log(`User ${socket.id} left poll ${pollId}`);
  });
});

// Mock data
let users = [
  {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
    token: 'mock-token-1'
  }
];
let polls = [];
let userIdCounter = 2;
let pollIdCounter = 1;

const getUserFromToken = (token) => {
  if (!token) return null;
  // Handle both "Bearer mock-token-X" and "mock-token-X" formats
  const cleanToken = token.replace('Bearer ', '');
  const userId = parseInt(cleanToken.replace('mock-token-', ''));
  return users.find(u => u.id === userId);
};

// Auth routes
app.post('/api/auth/signup', (req, res) => {
  const { username, email, password } = req.body;
  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({ message: 'User already exists' });
  }
  const newUser = { id: userIdCounter++, username, email, password, token: 'mock-token-' + userIdCounter };
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
  const newPoll = {
    _id: pollIdCounter++,
    question,
    options: options.map((opt, idx) => ({ text: opt, votes: 0 })),
    isPublic: isPublic || false,
    creator: { _id: user.id, username: user.username },
    createdBy: user.id,
    createdAt: new Date()
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

  // Emit real-time update to all connected clients
  io.to(`poll-${poll._id}`).emit('poll-updated', poll);

  res.json(poll);
});

server.listen(PORT, () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const backendUrl = isProduction
    ? process.env.PRODUCTION_BACKEND_URL || `http://localhost:${PORT}`
    : `http://localhost:${PORT}`;

  console.log(`🚀 Mock backend server running on ${backendUrl}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔒 CORS allowed origins: ${process.env.ALLOWED_ORIGINS || 'http://localhost:5173, http://localhost:3000, http://127.0.0.1:5174'}`);
});
