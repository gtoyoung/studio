import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getMessaging, isSupported } from "firebase/messaging";
import { firebaseConfig } from "./config";

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const firestore = getFirestore(app);

let messaging: ReturnType<typeof getMessaging> | null = null;
let messagingInitialized = false;

if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      try {
        messaging = getMessaging(app);
        messagingInitialized = true;
      } catch (error) {
        console.error("Firebase Messaging initialization failed:", error);
      }
    }
  });
}

export { app, auth, firestore, messaging, messagingInitialized };
