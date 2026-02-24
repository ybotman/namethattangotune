// utils/firebase.js
// Firebase initialization for NTTT

import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  EmailAuthProvider,
  OAuthProvider
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Decode the Base64 encoded JSON string from the environment variable
// Set NEXT_PUBLIC_FIREBASE_JSON in .env.local as Base64 encoded config
let firebaseConfig;

if (process.env.NEXT_PUBLIC_FIREBASE_JSON) {
  firebaseConfig = JSON.parse(
    Buffer.from(process.env.NEXT_PUBLIC_FIREBASE_JSON, 'base64').toString('utf-8')
  );
} else {
  // Fallback for development - you'll need to set these
  console.warn('NEXT_PUBLIC_FIREBASE_JSON not set, using placeholder config');
  firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_DOMAIN.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_BUCKET.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID",
  };
}

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
const auth = getAuth(app);

// Initialize Firestore for user data/scores
const db = getFirestore(app);

// Initialize Auth Providers
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');

const emailProvider = new EmailAuthProvider();

const appleProvider = new OAuthProvider('apple.com');
appleProvider.addScope('email');
appleProvider.addScope('name');

export { auth, db, googleProvider, emailProvider, appleProvider };
