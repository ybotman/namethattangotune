// ------------------------------------------------------------
// utils/firebase.js
// Firebase initialization for NTTT
// Architecture: tangotiempo-257ff for ALL auth and data
// See: /Users/tobybalsley/MyDocs/AppDev/TANGO-FIREBASE-ARCHITECTURE.md
// ------------------------------------------------------------

import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  EmailAuthProvider,
  OAuthProvider
} from 'firebase/auth';
import { getFirestore, collection } from 'firebase/firestore';

// Helper to decode base64 (works in browser and Node)
const decodeBase64 = (str) => {
  if (typeof window !== 'undefined') {
    return atob(str);
  }
  return Buffer.from(str, 'base64').toString('utf-8');
};

// === FIREBASE CONFIG (tangotiempo-257ff - single project for all) ===
let firebaseConfig;

if (process.env.NEXT_PUBLIC_FIREBASE_JSON) {
  try {
    firebaseConfig = JSON.parse(decodeBase64(process.env.NEXT_PUBLIC_FIREBASE_JSON));
  } catch (e) {
    console.error('Failed to parse NEXT_PUBLIC_FIREBASE_JSON:', e);
    firebaseConfig = null;
  }
}

if (!firebaseConfig) {
  console.warn('NEXT_PUBLIC_FIREBASE_JSON not set or invalid, using placeholder config');
  firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_DOMAIN.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_BUCKET.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID",
  };
}

// Initialize Firebase app (single app for everything)
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
const auth = getAuth(app);

// Initialize Firestore
const db = getFirestore(app);

// === COLLECTION PREFIXES (TEST vs PROD) ===
// VERCEL_ENV: 'production' | 'preview' | 'development' | undefined
const isProduction = process.env.VERCEL_ENV === 'production';
const prefix = isProduction ? '' : 'test_';

/**
 * Collection paths with environment-based prefixes
 * Production: users, nttt_sessions, nttt_feedback
 * Test/Preview: test_users, test_nttt_sessions, test_nttt_feedback
 */
export const collections = {
  users: `${prefix}users`,
  ntttSessions: `${prefix}nttt_sessions`,
  ntttFeedback: `${prefix}nttt_feedback`,
};

/**
 * Get a Firestore collection reference with proper prefix
 * @param {keyof collections} name - Collection name from collections object
 * @returns {CollectionReference} Firestore collection reference
 */
export const getCollectionRef = (name) => {
  const path = collections[name];
  if (!path) {
    throw new Error(`Unknown collection: ${name}`);
  }
  return collection(db, path);
};

/**
 * Get the user document path (with prefix)
 * @param {string} userId - Firebase user ID
 * @returns {string} Document path like "users/abc123" or "test_users/abc123"
 */
export const getUserDocPath = (userId) => `${prefix}users/${userId}`;

/**
 * Check if running in production
 * @returns {boolean}
 */
export const isProd = () => isProduction;

// Initialize Auth Providers
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');

const emailProvider = new EmailAuthProvider();

const appleProvider = new OAuthProvider('apple.com');
appleProvider.addScope('email');
appleProvider.addScope('name');

export { app, auth, db, googleProvider, emailProvider, appleProvider };
