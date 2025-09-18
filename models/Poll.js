class Poll {
  constructor(question, options, creator, isPublic = false) {
    this.id = Date.now().toString(); // Simple ID generation
    this.question = question;
    this.options = options.map(option => ({ text: option, votes: 0 }));
    this.creator = creator;
    this.isPublic = isPublic;
    this.voters = [];
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  save() {
    Poll.polls.push(this);
    return this;
  }

  static findById(id) {
    return Poll.polls.find(poll => poll.id === id);
  }

  static find(query = {}) {
    return Poll.polls.filter(poll => {
      for (const key in query) {
        if (poll[key] !== query[key]) return false;
      }
      return true;
    });
  }

  static updateVotes(pollId, optionIndex, userId) {
    const poll = Poll.findById(pollId);
    if (!poll) return null;

    // Check if user already voted
    const existingVote = poll.voters.find(v => v.user === userId);
    if (existingVote) {
      // Decrement previous vote count
      poll.options[existingVote.optionIndex].votes--;
      // Update vote
      existingVote.optionIndex = optionIndex;
    } else {
      poll.voters.push({ user: userId, optionIndex });
    }
    // Increment new vote count
    poll.options[optionIndex].votes++;
    poll.updatedAt = new Date();
    return poll;
  }
}

Poll.polls = [];

module.exports = Poll;
