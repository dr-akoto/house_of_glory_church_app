const { db } = require('../config/firebase');
const {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  where,
} = require('firebase/firestore');

const COLLECTION = 'media';

const mediaService = {
  async getAll(filters = {}) {
    try {
      let q;
      if (filters && filters.type) {
        q = query(
          collection(db, COLLECTION),
          where('type', '==', filters.type),
          orderBy('createdAt', 'desc')
        );
      } else {
        q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
      }
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('Error fetching media:', error);
      return [];
    }
  },

  async upload(media) {
    try {
      const docRef = await addDoc(collection(db, COLLECTION), {
        ...media,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error uploading media:', error);
      return { success: false, message: error.message };
    }
  },

  async delete(id) {
    try {
      await deleteDoc(doc(db, COLLECTION, id));
      return { success: true };
    } catch (error) {
      console.error('Error deleting media:', error);
      return { success: false, message: error.message };
    }
  },
};

module.exports = mediaService;
