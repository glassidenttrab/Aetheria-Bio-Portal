import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDemoKeyForSaaSPreviewOnly12345',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'neuroaegis-saas.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'neuroaegis-saas',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'neuroaegis-saas.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '918237465012',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:918237465012:web:abcdef1234567890',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
