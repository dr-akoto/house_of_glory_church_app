const { initializeApp } = require('firebase/app');
const { getFirestore } = require('firebase/firestore');
const { getAuth } = require('firebase/auth');

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD74jtcspY_7_gV71zX8EMjfA19UDumMdg",
  authDomain: "house-of-glory-df761.firebaseapp.com",
  projectId: "house-of-glory-df761",
  storageBucket: "house-of-glory-df761.firebasestorage.app",
  messagingSenderId: "825294278688",
  appId: "1:825294278688:web:c327877f444c53ee75ac45",
  measurementId: "G-CY0QD4NL4R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

module.exports = { app, db, auth };
