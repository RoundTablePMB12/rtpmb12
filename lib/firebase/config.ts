// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDoW5qn9_pwSeK5cwQ4yXpUuJWS0f3nBWg",
    authDomain: "roundtablepmb12-9ef2a.firebaseapp.com",
    projectId: "roundtablepmb12-9ef2a",
    storageBucket: "roundtablepmb12-9ef2a.appspot.com",
    messagingSenderId: "1096969220875",
    appId: "1:1096969220875:web:390ad31e4dafd1bd94280e",
    measurementId: "G-D76KZ45B1B"
};

// Initialize Firebase
let firebaseApp;

try {
  if (!getApps().length) {
    firebaseApp = initializeApp(firebaseConfig);
  } else {
    firebaseApp = getApps()[0];
  }
} catch (error) {
  console.error("Error initializing Firebase:", error);
  // Create a fallback app for development if there's an error
  firebaseApp = {} as any;
}

// Initialize Firestore
export const db = getFirestore(firebaseApp);

// Initialize Auth - wrapped in try/catch to prevent errors
let auth;
try {
  auth = getAuth(firebaseApp);
} catch (error) {
  console.error("Error initializing Firebase Auth:", error);
  auth = {} as any;
}

export { auth };
export default firebaseApp; 