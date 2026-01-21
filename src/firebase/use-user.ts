'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useAuth, useFirestore } from './client-provider';

interface FirebaseUser extends User {
  isAdmin?: boolean;
}

export const useUser = () => {
  const auth = useAuth();
  const firestore = useFirestore();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isUserLoading, setUserLoading] = useState(true); // Initially true

  useEffect(() => {
    if (!auth || !firestore) {
        // If Firebase services aren't available, stop loading and return.
        setUserLoading(false);
        return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(firestore, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        let userData;

        if (userSnap.exists()) {
          userData = userSnap.data();
        } else {
          const isInitialAdmin = user.displayName === '관리자';
          userData = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            isAdmin: isInitialAdmin,
          };
          await setDoc(userRef, userData);
        }

        const isAdmin = userData?.isAdmin === true;
        setUser({ ...user, isAdmin });

      } else {
        setUser(null);
      }
      // Set loading to false only after all async operations are complete
      setUserLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [auth, firestore]);

  return { user, isUserLoading };
};
