const mongoose = require('mongoose');

const pollSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true
  },
  options: [{
    text: {
      type: String,
      required: true
    },
    votes: {
      type: Number,
      default: 0
    }
  }],
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  voters: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    optionIndex: Number
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update updatedAt on save
pollSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to update votes
pollSchema.statics.updateVotes = async function(pollId, optionIndex, userId) {
  const poll = await this.findById(pollId);
  if (!poll) return null;

  // Check if user already voted
  const existingVoteIndex = poll.voters.findIndex(v => v.user.toString() === userId);
  if (existingVoteIndex !== -1) {
    // Decrement previous vote count
    const prevOptionIndex = poll.voters[existingVoteIndex].optionIndex;
    poll.options[prevOptionIndex].votes--;
    // Update vote
    poll.voters[existingVoteIndex].optionIndex = optionIndex;
  } else {
    poll.voters.push({ user: userId, optionIndex });
  }
  // Increment new vote count
  poll.options[optionIndex].votes++;
  poll.updatedAt = new Date();
  await poll.save();
  return poll;
};

module.exports = mongoose.model('Poll', pollSchema);
