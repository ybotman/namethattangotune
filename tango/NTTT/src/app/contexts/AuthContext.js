// src/contexts/AuthContext.js
// NTTT Authentication - Universal login, app handles its own auth

'use client';

import React, { createContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
} from 'firebase/auth';
import { auth, googleProvider, appleProvider } from '@/utils/firebase';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Just use Firebase user - app handles its own auth
        const token = await firebaseUser.getIdToken();
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          emailVerified: firebaseUser.emailVerified,
          token,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Authenticate with Google
  const authenticateWithGoogle = async () => {
    if (user) {
      setError('Already signed in.');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      setLoading(false);
      return result.user;
    } catch (err) {
      console.error('Google auth error:', err);
      handleAuthError(err);
      setLoading(false);
      return null;
    }
  };

  // Authenticate with Apple
  const authenticateWithApple = async () => {
    if (user) {
      setError('Already signed in.');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await signInWithPopup(auth, appleProvider);
      const firebaseUser = result.user;

      // Extract name from Apple on first login
      if (result.additionalUserInfo?.isNewUser && result.additionalUserInfo?.profile) {
        const profile = result.additionalUserInfo.profile;
        let fullName = '';

        if (profile.name && typeof profile.name === 'object') {
          fullName = `${profile.name.firstName || ''} ${profile.name.lastName || ''}`.trim();
        } else if (profile.firstName || profile.lastName) {
          fullName = `${profile.firstName || ''} ${profile.lastName || ''}`.trim();
        }

        if (fullName) {
          await updateProfile(firebaseUser, { displayName: fullName });
        }
      }

      setLoading(false);
      return firebaseUser;
    } catch (err) {
      console.error('Apple auth error:', err);
      handleAuthError(err);
      setLoading(false);
      return null;
    }
  };

  // Login with Email/Password
  const login = async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      setLoading(false);
      return result.user;
    } catch (err) {
      console.error('Login error:', err);
      handleAuthError(err);
      setLoading(false);
      return null;
    }
  };

  // Sign up with Email/Password
  const signUp = async ({ email, password, firstName, lastName }) => {
    setLoading(true);
    setError(null);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Set display name
      const displayName = `${firstName} ${lastName}`.trim();
      await updateProfile(firebaseUser, { displayName });

      // Send verification email
      try {
        await sendEmailVerification(firebaseUser);
      } catch (e) {
        console.warn('Verification email failed:', e);
      }

      setLoading(false);
      return firebaseUser;
    } catch (err) {
      console.error('Signup error:', err);
      handleAuthError(err);
      setLoading(false);
      return null;
    }
  };

  // Handle auth errors
  const handleAuthError = (err) => {
    const messages = {
      'auth/email-already-in-use': 'Email already in use.',
      'auth/invalid-email': 'Invalid email.',
      'auth/weak-password': 'Password too weak.',
      'auth/user-not-found': 'No account found.',
      'auth/wrong-password': 'Incorrect password.',
      'auth/popup-closed-by-user': 'Sign-in cancelled.',
      'auth/popup-blocked': 'Popup blocked.',
    };
    setError(messages[err.code] || err.message || 'An error occurred.');
  };

  // Logout
  const logOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setError(null);
    } catch (err) {
      console.error('Logout error:', err);
      setError('Failed to sign out.');
    }
  };

  // Password reset
  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (err) {
      const messages = {
        'auth/user-not-found': 'No account with this email.',
        'auth/invalid-email': 'Invalid email.',
        'auth/too-many-requests': 'Too many requests. Try later.',
      };
      return { success: false, error: messages[err.code] || 'Failed to send reset email.' };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      logOut,
      authenticateWithGoogle,
      authenticateWithApple,
      login,
      signUp,
      resetPassword,
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthProvider;
