// Test restart
require('dotenv').config({ path: './.env' });
const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const authRoutes = require('../routes/auth');
const pollRoutes = require('../routes/polls');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      const allowedOrigins = process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(',')
        : ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:5174'];

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // In development, allow localhost and 127.0.0.1 with any port
      if (process.env.NODE_ENV !== 'production' &&
          (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
        return callback(null, true);
      }

      callback(new Error('Not allowed by CORS'));
    },
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const allowedOrigins = process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',')
      : ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:5174'];

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // In development, allow localhost and 127.0.0.1 with any port
    if (process.env.NODE_ENV !== 'production' &&
        (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
      return callback(null, true);
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected successfully'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/polls', pollRoutes);

// Socket.io for real-time updates
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('vote', (pollId) => {
    io.emit('voteUpdate', pollId);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Handle server errors, particularly port conflicts
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Please choose a different port or kill the process using it.`);
    process.exit(1);
  } else {
    console.error('Server error:', err);
  }
});

module.exports = { app, io };
