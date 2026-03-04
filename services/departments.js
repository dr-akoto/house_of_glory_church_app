const { db } = require('../config/firebase');
const { auth } = require('../config/firebase');
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

const COLLECTION = 'departments';

// Remove undefined values from object (Firestore doesn't accept undefined)
function cleanData(obj) {
  const cleaned = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      cleaned[key] = value === null ? '' : value; // Convert null to empty string
    }
  }
  return cleaned;
}

const departmentsService = {
  async getAll() {
    try {
      console.log('Current auth user:', auth.currentUser?.email || 'NOT AUTHENTICATED');
      let snapshot;
      try {
        const q = query(collection(db, COLLECTION), orderBy('name'));
        snapshot = await getDocs(q);
      } catch (indexError) {
        // Fallback without ordering if index doesn't exist
        snapshot = await getDocs(collection(db, COLLECTION));
      }
      return snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
    } catch (error) {
      console.error('Error fetching departments:', error);
      return [];
    }
  },

  async create(department) {
    try {
      console.log('Current auth user for create:', auth.currentUser?.email || 'NOT AUTHENTICATED');
      const cleanedData = cleanData({
        name: department.name || '',
        description: department.description || '',
        leader: department.leader || '',
        meetingDay: department.meetingDay || '',
        meetingTime: department.meetingTime || '',
        ...department,
      });
      
      const docRef = await addDoc(collection(db, COLLECTION), {
        ...cleanedData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error creating department:', error);
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
      console.error('Error updating department:', error);
      return { success: false, message: error.message };
    }
  },

  async delete(id) {
    try {
      await deleteDoc(doc(db, COLLECTION, id));
      return { success: true };
    } catch (error) {
      console.error('Error deleting department:', error);
      return { success: false, message: error.message };
    }
  },
};

module.exports = departmentsService;
