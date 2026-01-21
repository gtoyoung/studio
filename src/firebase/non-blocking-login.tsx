'use client';
import {
  Auth, // Import Auth type for type hinting
  GoogleAuthProvider,
  signInWithRedirect, // Changed from signInWithPopup
  signOut,
} from 'firebase/auth';

/** Initiate Google sign-in (non-blocking). */
export function initiateGoogleSignIn(authInstance: Auth): void {
  const provider = new GoogleAuthProvider();
  // CRITICAL: Call signInWithRedirect directly. Do NOT use 'await'.
  // Using redirect instead of popup to avoid popup blockers.
  signInWithRedirect(authInstance, provider).catch((error) => {
    // This catch block handles errors during the redirect initiation.
    console.error("Google Sign-In Error:", error);
  });
}

/** Initiate user sign-out (non-blocking). */
export function signOutUser(authInstance: Auth): void {
  // CRITICAL: Call signOut directly. Do NOT use 'await'.
  signOut(authInstance);
}
