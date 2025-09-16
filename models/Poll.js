const mongoose = require('mongoose');

const pollSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  options: [{
    text: {
      type: String,
      required: true,
    },
    votes: {
      type: Number,
      default: 0,
    },
  }],
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
  voters: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    optionIndex: Number,
  }],
}, {
  timestamps: true,
});

module.exports = mongoose.model('Poll', pollSchema);
