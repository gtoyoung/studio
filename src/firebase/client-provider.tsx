"use client";

import { createContext, useContext } from "react";
import { Auth } from "firebase/auth";
import { Firestore } from "firebase/firestore";
import { auth, firestore } from "./firebase-init";

const FirebaseContext = createContext<{ auth: Auth; firestore: Firestore }>({
  auth,
  firestore,
});

export function FirebaseClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FirebaseContext.Provider value={{ auth, firestore }}>
      {children}
    </FirebaseContext.Provider>
  );
}

export const useAuth = () => useContext(FirebaseContext).auth;
export const useFirestore = () => useContext(FirebaseContext).firestore;
