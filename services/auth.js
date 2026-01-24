const { auth, db } = require('../config/firebase');
const {
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} = require('firebase/auth');
const { doc, getDoc } = require('firebase/firestore');

const authService = {
  async login(credentials) {
    try {
      const { email, password } = credentials;
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Fetch user role from Firestore
      let role = 'member'; // Default role
      try {
        const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
        if (userDoc.exists()) {
          role = userDoc.data().role || 'member';
        }
      } catch (e) {
        console.log('Could not fetch user role, using default');
      }
      
      return {
        success: true,
        user: {
          id: userCredential.user.uid,
          email: userCredential.user.email,
          role: role,
        },
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.message || 'Invalid email or password',
      };
    }
  },

  async logout() {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, message: error.message };
    }
  },

  async checkAuth() {
    try {
      const user = auth.currentUser;
      if (user) {
        // Fetch user role from Firestore
        let role = 'member';
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            role = userDoc.data().role || 'member';
          }
        } catch (e) {
          console.log('Could not fetch user role');
        }
        
        return {
          isAuthenticated: true,
          user: {
            id: user.uid,
            email: user.email,
            role: role,
          },
        };
      }
      return { isAuthenticated: false };
    } catch (error) {
      return { isAuthenticated: false };
    }
  },

  async changePassword(data) {
    try {
      const user = auth.currentUser;
      if (!user) {
        return { success: false, message: 'Not authenticated' };
      }

      // Re-authenticate user
      const credential = EmailAuthProvider.credential(user.email, data.currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, data.newPassword);
      return { success: true };
    } catch (error) {
      console.error('Change password error:', error);
      return {
        success: false,
        message: error.message || 'Failed to change password',
      };
    }
  },
};

module.exports = authService;
