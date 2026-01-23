"use client";

import { useEffect } from "react";
import { firebaseConfig } from "@/firebase/config";

export default function PushProvider() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const init = async () => {
      const registration = await navigator.serviceWorker.ready;

      const message = {
        type: "FIREBASE_CONFIG",
        config: firebaseConfig,
      };

      if (registration.active) {
        registration.active.postMessage(message);
        console.log("[PushProvider] sent to active SW");
      }

      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage(message);
        console.log("[PushProvider] sent to controller SW");
      }
    };

    init().catch(console.error);
  }, []);
  return null;
}
