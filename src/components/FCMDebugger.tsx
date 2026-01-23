'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/firebase/client-provider';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

export function FCMDebugger() {
  const auth = useAuth();
  const [debugInfo, setDebugInfo] = useState<{
    userId: string | null;
    firestoreToken: string | null;
    localToken: string | null;
    swRegistered: boolean;
    swActive: boolean;
    swState: string;
  } | null>(null);

  useEffect(() => {
    const checkFCM = async () => {
      try {
        // 1. Get current user
        const user = auth.currentUser;
        const userId = user?.uid || null;

        // 2. Check Service Worker
        let swRegistered = false;
        let swActive = false;
        let swState = 'not available';

        if ('serviceWorker' in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          swRegistered = registrations.length > 0;
          
          if (registrations.length > 0) {
            const registration = registrations[0];
            swActive = !!registration.active;
            swState = registration.active ? 'active' : 'inactive';
          }
        }

        // 3. Get FCM token from Firestore
        let firestoreToken = null;
        if (userId) {
          try {
            const firestore = getFirestore();
            const userDoc = await getDoc(doc(firestore, 'users', userId));
            firestoreToken = userDoc.data()?.fcmToken || 'NOT FOUND';
          } catch (error) {
            firestoreToken = `ERROR: ${error}`;
          }
        }

        // 4. Get local token from localStorage
        const localToken = localStorage.getItem('fcm_token') || 'NOT STORED';

        setDebugInfo({
          userId,
          firestoreToken,
          localToken,
          swRegistered,
          swActive,
          swState,
        });
      } catch (error) {
        console.error('Debug error:', error);
      }
    };

    // Check on load and every 5 seconds
    checkFCM();
    const interval = setInterval(checkFCM, 5000);

    return () => clearInterval(interval);
  }, [auth]);

  if (!debugInfo) {
    return null;
  }

  const isTokenValid = 
    debugInfo.userId && 
    debugInfo.firestoreToken && 
    debugInfo.firestoreToken !== 'NOT FOUND' &&
    !debugInfo.firestoreToken.includes('ERROR');

  return (
    <div className="fixed bottom-20 left-4 bg-gray-900 text-white text-xs p-3 rounded-lg max-w-xs font-mono z-40 border border-gray-700">
      <div className="font-bold mb-2">FCM Debug Info</div>
      
      <div className="space-y-1">
        <div>
          User ID: <span className={debugInfo.userId ? 'text-green-400' : 'text-red-400'}>
            {debugInfo.userId || 'NOT LOGGED IN'}
          </span>
        </div>
        
        <div>
          SW: <span className={debugInfo.swActive ? 'text-green-400' : 'text-red-400'}>
            {debugInfo.swState}
          </span>
        </div>
        
        <div>
          Firestore Token: 
          <div className={`text-xs break-all ${
            isTokenValid ? 'text-green-400' : 'text-red-400'
          }`}>
            {debugInfo.firestoreToken?.substring(0, 20)}...
          </div>
        </div>
        
        <div>
          Local Token: 
          <div className="text-xs break-all text-yellow-400">
            {debugInfo.localToken?.substring(0, 20)}...
          </div>
        </div>
      </div>

      {isTokenValid && (
        <div className="mt-2 p-1 bg-green-900 rounded text-green-300 text-xs">
          ✅ Ready for FCM (Logged in)!
        </div>
      )}
      
      {!isTokenValid && debugInfo.userId && (
        <div className="mt-2 p-1 bg-red-900 rounded text-red-300 text-xs">
          ❌ Token not saved to Firestore
        </div>
      )}

      {!debugInfo.userId && debugInfo.localToken && !debugInfo.localToken.includes('NOT') && (
        <div className="mt-2 p-1 bg-yellow-900 rounded text-yellow-300 text-xs">
          ⚠️ Not logged in - token in localStorage
          <br />
          Use this token for testing
        </div>
      )}
    </div>
  );
}
