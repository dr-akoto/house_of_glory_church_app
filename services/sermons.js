const { db } = require('../config/firebase');
const {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
} = require('firebase/firestore');

const COLLECTION = 'sermons';

// Remove undefined values from object (Firestore doesn't accept undefined)
function cleanData(obj) {
  const cleaned = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

const sermonsService = {
  async getAll() {
    try {
      let snapshot;
      try {
        const q = query(collection(db, COLLECTION), orderBy('date', 'desc'));
        snapshot = await getDocs(q);
      } catch (indexError) {
        // If index error, just get all docs without ordering
        console.log('Sermons index not available, fetching without order:', indexError.message);
        snapshot = await getDocs(collection(db, COLLECTION));
      }
      return snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
    } catch (error) {
      console.error('Error fetching sermons:', error);
      return [];
    }
  },

  async create(sermon) {
    try {
      const cleanedData = cleanData(sermon);
      const docRef = await addDoc(collection(db, COLLECTION), {
        ...cleanedData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error creating sermon:', error);
      return { success: false, message: error.message };
    }
  },

  async update(id, data) {
    try {
      const cleanedData = cleanData(data);
      const docRef = doc(db, COLLECTION, id);
      await updateDoc(docRef, {
        ...cleanedData,
        updatedAt: new Date().toISOString(),
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating sermon:', error);
      return { success: false, message: error.message };
    }
  },

  async delete(id) {
    try {
      await deleteDoc(doc(db, COLLECTION, id));
      return { success: true };
    } catch (error) {
      console.error('Error deleting sermon:', error);
      return { success: false, message: error.message };
    }
  },
};

module.exports = sermonsService;
