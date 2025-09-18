const express = require('express');
const Poll = require('../models/Poll');
const auth = require('../middleware/auth');

const router = express.Router();

// Create poll
router.post('/', auth, async (req, res) => {
  try {
    const { question, options, isPublic } = req.body;
    const poll = new Poll(question, options, req.user.id, isPublic || false);
    poll.save();
    res.status(201).json(poll);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get polls by user
router.get('/my', auth, async (req, res) => {
  try {
    const polls = Poll.find({ creator: req.user.id });
    res.json(polls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get poll by id
router.get('/:id', async (req, res) => {
  try {
    const poll = Poll.findById(req.params.id);
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
    const poll = Poll.updateVotes(req.params.id, optionIndex, req.user.id);
    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    res.json(poll);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete poll
router.delete('/:id', auth, async (req, res) => {
  try {
    const poll = Poll.findById(req.params.id);
    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }
    if (poll.creator !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this poll' });
    }
    Poll.polls = Poll.polls.filter(p => p.id !== req.params.id);
    res.json({ message: 'Poll deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
