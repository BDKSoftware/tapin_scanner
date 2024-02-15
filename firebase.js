// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeAuth } from "firebase/auth";

import "firebase/compat/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAU4XOLoyt2ViI5TNGWyrNwBvjSKiO7TAg",
  authDomain: "tapin-prod.firebaseapp.com",
  projectId: "tapin-prod",
  storageBucket: "tapin-prod.appspot.com",
  messagingSenderId: "379640924019",
  appId: "1:379640924019:web:3ad634ae3414662ddc6706",
  measurementId: "G-KLDB69TZLT",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
initializeAuth(app);

export default app;
