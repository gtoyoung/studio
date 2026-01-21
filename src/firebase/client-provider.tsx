'use client';

import { createContext, useContext } from 'react';
import { Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';
import { auth, firestore } from './firebase-init';

// Create a context for the Firebase SDKs
const FirebaseContext = createContext<{ auth: Auth; firestore: Firestore; }>({ auth, firestore });

// The provider component
export function FirebaseClientProvider({ children }: { children: React.ReactNode }) {
  return (
    <FirebaseContext.Provider value={{ auth, firestore }}>
      {children}
    </FirebaseContext.Provider>
  );
}

// Hook to use Firebase Auth
export const useAuth = () => {
  return useContext(FirebaseContext).auth;
};

// Hook to use Firestore
export const useFirestore = () => {
  return useContext(FirebaseContext).firestore;
};
