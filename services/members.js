const { db, auth } = require('../config/firebase');
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

const COLLECTION = 'members';

// Normalize member data to handle various field name formats
function normalizeMember(data) {
  // Build fullName from firstName/lastName if fullName not available
  let fullName = data.fullName || data.full_name || '';
  if (!fullName && (data.firstName || data.lastName)) {
    fullName = `${data.firstName || ''} ${data.lastName || ''}`.trim();
  }
  if (!fullName && data.name) {
    fullName = data.name;
  }

  return {
    fullName: fullName,
    firstName: data.firstName || '',
    lastName: data.lastName || '',
    email: data.email || '',
    phoneNumber: data.phoneNumber || data.phone_number || data.phone || '',
    whatsappNumber: data.whatsappNumber || data.whatsapp_number || '',
    dateOfBirth: data.dateOfBirth || data.date_of_birth || null,
    gender: data.gender || '',
    category: data.category || '',
    occupation: data.occupation || data.departmentId || data.department_id || data.department || '',
    rolePosition: data.rolePosition || data.role_position || '',
    joinDate: data.joinDate || data.join_date || null,
    status: data.status || 'active',
    address: data.address || '',
    notes: data.notes || '',
    createdAt: data.createdAt || data.created_at || null,
    updatedAt: data.updatedAt || data.updated_at || null,
  };
}

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

const membersService = {
  async getAll() {
    try {
      // Try with orderBy first, fall back to unordered if index doesn't exist
      let snapshot;
      try {
        const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
        snapshot = await getDocs(q);
      } catch (indexError) {
        // If index error, just get all docs without ordering
        console.log('Index not available, fetching without order');
        snapshot = await getDocs(collection(db, COLLECTION));
      }
      
      return snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...normalizeMember(docSnap.data()),
      }));
    } catch (error) {
      console.error('Error fetching members:', error);
      return [];
    }
  },

  async create(member) {
    try {
      const cleanedData = cleanData(member);
      const docRef = await addDoc(collection(db, COLLECTION), {
        ...cleanedData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error creating member:', error);
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
      console.error('Error updating member:', error);
      return { success: false, message: error.message };
    }
  },

  async delete(id) {
    try {
      await deleteDoc(doc(db, COLLECTION, id));
      return { success: true };
    } catch (error) {
      console.error('Error deleting member:', error);
      return { success: false, message: error.message };
    }
  },
};

module.exports = membersService;
