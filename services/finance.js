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
  where,
} = require('firebase/firestore');

const COLLECTION = 'finance';
const TITHES_COLLECTION = 'tithes';

const financeService = {
  async getAll() {
    try {
      const q = query(collection(db, COLLECTION), orderBy('date', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('Error fetching finance records:', error);
      return [];
    }
  },

  async create(transaction) {
    try {
      const docRef = await addDoc(collection(db, COLLECTION), {
        ...transaction,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error creating transaction:', error);
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
      console.error('Error updating transaction:', error);
      return { success: false, message: error.message };
    }
  },

  async delete(id) {
    try {
      await deleteDoc(doc(db, COLLECTION, id));
      return { success: true };
    } catch (error) {
      console.error('Error deleting transaction:', error);
      return { success: false, message: error.message };
    }
  },

  async getStats() {
    try {
      const transactions = await this.getAll();
      
      const totalIncome = transactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
      
      const totalExpenses = transactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
      
      const totalTithes = transactions
        .filter((t) => t.category === 'tithe')
        .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
      
      return {
        success: true,
        data: {
          totalIncome,
          totalExpenses,
          totalTithes,
          balance: totalIncome - totalExpenses,
        },
      };
    } catch (error) {
      console.error('Error getting finance stats:', error);
      return { success: false, message: error.message };
    }
  },

  // Tithe methods
  async getTithes() {
    try {
      const q = query(collection(db, TITHES_COLLECTION), orderBy('date', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('Error fetching tithes:', error);
      return [];
    }
  },

  async addTithe(tithe) {
    try {
      const docRef = await addDoc(collection(db, TITHES_COLLECTION), {
        ...tithe,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error adding tithe:', error);
      return { success: false, message: error.message };
    }
  },

  async updateTithe(id, data) {
    try {
      const docRef = doc(db, TITHES_COLLECTION, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date().toISOString(),
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating tithe:', error);
      return { success: false, message: error.message };
    }
  },

  async deleteTithe(id) {
    try {
      await deleteDoc(doc(db, TITHES_COLLECTION, id));
      return { success: true };
    } catch (error) {
      console.error('Error deleting tithe:', error);
      return { success: false, message: error.message };
    }
  },
};

module.exports = financeService;
