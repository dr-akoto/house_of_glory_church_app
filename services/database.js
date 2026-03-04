const { db } = require('../config/firebase');

// Database initialization utilities
const database = {
  getDb() {
    return db;
  },
};

module.exports = database;
