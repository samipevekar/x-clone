// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "x-clone-b8d26.firebaseapp.com",
  projectId: "x-clone-b8d26",
  storageBucket: "x-clone-b8d26.appspot.com",
  messagingSenderId: "103644016660",
  appId: "1:103644016660:web:7d1ff5785cff818ba37701"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);