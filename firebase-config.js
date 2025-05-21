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
  databaseURL: "https://cyber-academy-4238a-default-rtdb.asia-southeast1.firebasedatabase.app"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize services
const auth = firebase.auth();
const db = firebase.database();

// Optional: Initialize Analytics if available
try {
  const analytics = firebase.analytics();
} catch (e) {
  console.log("Analytics not available or blocked");
}

// Enable persistence for better offline experience
try {
  firebase.database().setPersistenceEnabled(true).catch(err => {
    console.log("Persistence error:", err);
  });
} catch (e) {
  console.log("Error enabling persistence:", e);
}

// These services are available globally when this script is included
