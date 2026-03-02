// utils/firebase.js
// Firebase initialization for NTTT
// Auth: tangotiempo (shared users across tango apps)
// Data: nttttest/ntttprod (NTTT-specific data)

import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  EmailAuthProvider,
  OAuthProvider
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Helper to decode base64 (works in browser and Node)
const decodeBase64 = (str) => {
  if (typeof window !== 'undefined') {
    return atob(str);
  }
  return Buffer.from(str, 'base64').toString('utf-8');
};

// === AUTH CONFIG (tangotiempo - shared users) ===
// Decode the Base64 encoded JSON string from the environment variable
let authConfig;

if (process.env.NEXT_PUBLIC_FIREBASE_JSON) {
  try {
    authConfig = JSON.parse(decodeBase64(process.env.NEXT_PUBLIC_FIREBASE_JSON));
  } catch (e) {
    console.error('Failed to parse NEXT_PUBLIC_FIREBASE_JSON:', e);
    authConfig = null;
  }
}

if (!authConfig) {
  console.warn('NEXT_PUBLIC_FIREBASE_JSON not set or invalid, using placeholder config');
  authConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_DOMAIN.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_BUCKET.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID",
  };
}

// === DATA CONFIG (nttttest/ntttprod - NTTT data) ===
let dataConfig;

if (process.env.NEXT_PUBLIC_NTTT_FIREBASE_JSON) {
  try {
    dataConfig = JSON.parse(decodeBase64(process.env.NEXT_PUBLIC_NTTT_FIREBASE_JSON));
  } catch (e) {
    console.error('Failed to parse NEXT_PUBLIC_NTTT_FIREBASE_JSON:', e);
    dataConfig = null;
  }
}

if (!dataConfig) {
  // Fallback: use auth config for data too (single project mode)
  console.warn('NEXT_PUBLIC_NTTT_FIREBASE_JSON not set, using auth config for data');
  dataConfig = authConfig;
}

// Initialize Firebase apps
const authApp = initializeApp(authConfig);

// Only create second app if configs are different
const dataApp = dataConfig.projectId !== authConfig.projectId
  ? initializeApp(dataConfig, 'nttt-data')
  : authApp;

// Initialize Firebase Auth (from auth project)
const auth = getAuth(authApp);

// Initialize Firestore (from data project)
const db = getFirestore(dataApp);

// Initialize Auth Providers
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');

const emailProvider = new EmailAuthProvider();

const appleProvider = new OAuthProvider('apple.com');
appleProvider.addScope('email');
appleProvider.addScope('name');

export { auth, db, googleProvider, emailProvider, appleProvider };
