// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDsuNFywO14AUhydNMIbxOtl8rXnG0HMWM",
  authDomain: "ethereal-mind.firebaseapp.com",
  databaseURL: "https://ethereal-mind-default-rtdb.firebaseio.com",
  projectId: "ethereal-mind",
  storageBucket: "ethereal-mind.firebasestorage.app",
  messagingSenderId: "629688868918",
  appId: "1:629688868918:web:528941bff1a4dc5fda7897",
  measurementId: "G-W7JNTWD5WF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Set persistence to LOCAL
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("Firebase persistence set to LOCAL");
  })
  .catch((error) => {
    console.error("Error setting persistence:", error);
  });

console.log("Firebase initialized successfully");

// Export the initialized services
export { app, auth, db, storage, analytics }; 