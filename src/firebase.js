// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from "@firebase/firestore"
const firebaseConfig = {
  apiKey: "AIzaSyCQuwTUtOtPAS0G1XSoUHkyHDGxhFYPJak",
  authDomain: "web2-auth-44b14.firebaseapp.com",
  projectId: "web2-auth-44b14",
  storageBucket: "web2-auth-44b14.appspot.com",
  messagingSenderId: "423066088150",
  appId: "1:423066088150:web:7ba556fa13a98ad5364f77"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app);
