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
      options: options.map(opt => ({ text: opt, votes: 0 })),
      creator: req.user._id,
      isPublic: isPublic || false
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
    const polls = await Poll.find({ creator: req.user._id });
    res.json(polls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get poll by id
router.get('/:id', async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);
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
    const poll = await Poll.updateVotes(req.params.id, optionIndex, req.user._id);
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
    const poll = await Poll.findById(req.params.id);
    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }
    if (poll.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this poll' });
    }
    await poll.deleteOne();
    res.json({ message: 'Poll deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update poll (e.g., make public)
router.put('/:id', auth, async (req, res) => {
  try {
    const { isPublic } = req.body;
    const poll = await Poll.findById(req.params.id);
    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }
    if (poll.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    poll.isPublic = isPublic;
    await poll.save();
    res.json(poll);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get share URL for poll
router.get('/:id/share', auth, async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }
    if (poll.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const shareUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/poll/${poll.slug}`;
    res.json({ shareUrl });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get public poll by slug
router.get('/public/:slug', async (req, res) => {
  try {
    const poll = await Poll.findOne({ slug: req.params.slug, isPublic: true });
    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }
    res.json(poll);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
