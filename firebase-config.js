// Firebase Configuration
// This version uses the Firebase v8 SDK with <script> tags instead of ES modules
const firebaseConfig = {
  apiKey: "AIzaSyBF5kR3AfnLkW-jEf8aC-F_ecOjFc3608s",
  authDomain: "cyber-academy-4238a.firebaseapp.com",
  projectId: "cyber-academy-4238a",
  storageBucket: "cyber-academy-4238a.firebasestorage.app",
  messagingSenderId: "919279959221",
  appId: "1:919279959221:web:beb3698ceaa0400b2212fc",
  measurementId: "G-MG960E71PH",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize services
const auth = firebase.auth();
const db = firebase.firestore();

// Optional: Initialize Analytics if available
try {
  const analytics = firebase.analytics();
} catch (e) {
  console.log("Analytics not available or blocked");
}

// Optional: Enable Firebase persistence for offline capabilities
// firebase.firestore().enablePersistence()
//   .catch((err) => {
//     console.error('Firebase persistence error:', err.code);
//   });

// These services are available globally when this script is included
