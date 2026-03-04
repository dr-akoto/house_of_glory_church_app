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
      // Get all tithes without ordering to avoid index issues
      const snapshot = await getDocs(collection(db, TITHES_COLLECTION));
      const tithes = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log('Fetched tithes:', tithes.length, tithes);
      return tithes;
    } catch (error) {
      console.error('Error fetching tithes:', error);
      return [];
    }
  },

  async addTithe(tithe) {
    try {
      console.log('Adding tithe:', tithe);
      // Add tithe to tithes collection
      const titheDocRef = await addDoc(collection(db, TITHES_COLLECTION), {
        ...tithe,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // Also add a corresponding finance transaction
      const financeTransaction = {
        type: 'income',
        category: 'tithe',
        amount: tithe.amount,
        memberId: tithe.memberId || null,
        memberName: tithe.memberName || '',
        date: tithe.date || new Date().toISOString(),
        notes: tithe.notes || '',
        source: 'tithe',
        titheId: titheDocRef.id, // Link to tithe record
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const financeDocRef = await addDoc(collection(db, COLLECTION), financeTransaction);

      console.log('Tithe added with ID:', titheDocRef.id, 'and finance transaction ID:', financeDocRef.id);
      return { success: true, id: titheDocRef.id, financeId: financeDocRef.id };
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

      // Also update the corresponding finance transaction if it exists
      // Find the finance transaction with titheId === id
      const q = query(collection(db, COLLECTION), where('titheId', '==', id));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const financeDoc = snapshot.docs[0];
        await updateDoc(doc(db, COLLECTION, financeDoc.id), {
          amount: data.amount,
          memberId: data.memberId || null,
          memberName: data.memberName || '',
          date: data.date || new Date().toISOString(),
          notes: data.notes || '',
          updatedAt: new Date().toISOString(),
        });
      }
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
