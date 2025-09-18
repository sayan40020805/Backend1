const bcrypt = require('bcryptjs');

// In-memory storage for users
const users = [];

class User {
  constructor(username, email, password) {
    this.id = Date.now().toString(); // Simple ID generation
    this.username = username;
    this.email = email;
    this.password = password;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  async save() {
    // Hash password before saving
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    users.push(this);
    return this;
  }

  async comparePassword(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
  }

  static findOne(query) {
    return users.find(user => {
      for (const key in query) {
        if (user[key] !== query[key]) return false;
      }
      return true;
    });
  }

  static findById(id) {
    return users.find(user => user.id === id);
  }

  static find() {
    return users;
  }
}

module.exports = User;
