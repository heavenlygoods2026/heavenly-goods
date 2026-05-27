import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyASXI_2WzQ-X3afWpkvpPW-C6uHXUyLcdM",
  authDomain: "heavenly-goods.firebaseapp.com",
  projectId: "heavenly-goods",
  storageBucket: "heavenly-goods.firebasestorage.app",
  messagingSenderId: "718413199981",
  appId: "1:718413199981:web:4efd8d9b04aa7e03ca5d64",
  measurementId: "G-9TL2G2835F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
