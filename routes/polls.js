const express = require('express');
const Poll = require('../models/Poll');
const auth = require('../middleware/auth');

const router = express.Router();

// Create poll
router.post('/', auth, async (req, res) => {
  try {
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
    res.status(400).json({ message: error.message });
  }
});

// Get polls by user
router.get('/my', auth, async (req, res) => {
  try {
    const polls = await Poll.find({ creator: req.user._id }).populate('creator', 'username');
    res.json(polls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get poll by id
router.get('/:id', async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id).populate('creator', 'username').populate('voters.user', 'username');
    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }
    res.json(poll);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Vote on poll
router.post('/:id/vote', auth, async (req, res) => {
  try {
    const { optionIndex } = req.body;
    const poll = await Poll.findById(req.params.id);
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

    // Emit real-time update
    const { io } = require('../src/server');
    io.emit('voteUpdate', req.params.id);

    res.json(poll);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete poll
router.delete('/:id', auth, async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }
    if (poll.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this poll' });
    }
    await Poll.findByIdAndDelete(req.params.id);
    res.json({ message: 'Poll deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
