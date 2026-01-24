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

const COLLECTION = 'announcements';

const announcementsService = {
  async getAll() {
    try {
      const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('Error fetching announcements:', error);
      return [];
    }
  },

  async create(announcement) {
    try {
      const docRef = await addDoc(collection(db, COLLECTION), {
        ...announcement,
        sent: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error creating announcement:', error);
      return { success: false, message: error.message };
    }
  },

  async update(id, data) {
    try {
      const docRef = doc(db, COLLECTION, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date().toISOString(),
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating announcement:', error);
      return { success: false, message: error.message };
    }
  },

  async delete(id) {
    try {
      await deleteDoc(doc(db, COLLECTION, id));
      return { success: true };
    } catch (error) {
      console.error('Error deleting announcement:', error);
      return { success: false, message: error.message };
    }
  },

  async send(data) {
    try {
      const docRef = doc(db, COLLECTION, data.id);
      await updateDoc(docRef, {
        sent: true,
        sentAt: new Date().toISOString(),
        sentChannels: data.channels,
        updatedAt: new Date().toISOString(),
      });
      // Here you would integrate with email/SMS service
      return { success: true };
    } catch (error) {
      console.error('Error sending announcement:', error);
      return { success: false, message: error.message };
    }
  },
};

module.exports = announcementsService;
