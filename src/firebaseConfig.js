// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBMQ501EPTFOWh84g19a8YTV1Th605y468",
  authDomain: "hardware-software-ai.firebaseapp.com",
  projectId: "hardware-software-ai",
  storageBucket: "hardware-software-ai.firebasestorage.app",
  messagingSenderId: "932474575815",
  appId: "1:932474575815:web:54b70c7a56d0b6690d57e2",
  measurementId: "G-YMLSKVDBHD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firestore database instance
export const db = getFirestore(app);
