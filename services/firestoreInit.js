const { db } = require('../config/firebase');

// Firestore initialization utilities
const firestoreInit = {
  getFirestore() {
    return db;
  },
};

module.exports = firestoreInit;
