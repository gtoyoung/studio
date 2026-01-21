'use client';

import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { useFirestore } from './client-provider';

export const useDoc = <T>(path: string | null) => {
  const firestore = useFirestore();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firestore || !path) {
      setLoading(false);
      setData(null);
      return;
    }

    setLoading(true);
    const docRef = doc(firestore, path);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setData(docSnap.data() as T);
      } else {
        setData(null);
      }
      setLoading(false);
    }, (error) => {
        console.error("Error fetching document:", error);
        setData(null);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [firestore, path]);

  return { data, loading };
};
