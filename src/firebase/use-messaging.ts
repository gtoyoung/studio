import { useEffect, useState } from 'react';
import { messaging } from './firebase-init';
import { getToken, onMessage } from 'firebase/messaging';
import { useUser } from './use-user';
import { useFirestore } from './client-provider';

export const useMessaging = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const { user } = useUser();
  const firestore = useFirestore();

  useEffect(() => {
    if (!messaging) {
      setIsSupported(false);
      console.warn('[useMessaging] Firebase Messaging is not available');
      return;
    }

    setIsSupported(true);
    setNotificationPermission(Notification.permission);

    // ========== FCM 토큰 초기화 ==========
    const initializeMessaging = async () => {
      try {
        if (Notification.permission === 'granted' && messaging) {
          const token = await getToken(messaging, {
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
          });

          if (token) {
            await fetch("/api/fcm/subscribe", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ token }),
            });
          }
        }
      } catch (error) {
      }
    };

    initializeMessaging();
  }, [user, firestore]);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      return false;
    }

    if (Notification.permission === 'granted') {
      if (messaging) {
        try {
          const token = await getToken(messaging, {
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
          });
          alert(token);
          if (token) {
            await fetch("/api/fcm/subscribe", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ token }),
            });
          }
        } catch (error) {}
      }
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);

      if (permission === 'granted' && messaging) {
        try {
          const token = await getToken(messaging, {
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
          });
          alert(token);
          if (token) {
            await fetch("/api/fcm/subscribe", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ token }),
            });
          }
        } catch (error) {
        }
      }

      return permission === 'granted';
    }

    return false;
  };

  return {
    isSupported,
    notificationPermission,
    requestPermission,
  };
};
