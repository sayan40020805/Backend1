// Test restart
require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
/* Removed mongoose import and connection to remove local MongoDB */
const { Server } = require('socket.io');
const authRoutes = require('../routes/auth');
const pollRoutes = require('../routes/polls');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  }
});

app.use(cors());
app.use(express.json());



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
