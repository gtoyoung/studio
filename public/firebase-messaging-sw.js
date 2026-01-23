/* =====================================================
 * Firebase Cloud Messaging Service Worker (Web FCM)
 * ===================================================== */

/* Firebase SDK (compat) */
importScripts(
  "https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js",
);


/* =====================================================
 * 🔥 Firebase Initialize (⚠️ 반드시 여기서 직접!)
 * ===================================================== */

firebase.initializeApp({
  apiKey: "AIzaSyAImoxbMxJFUa-3Nnpa8s6Up2LEvVBwHbM",
  authDomain: "studio-6823834543-894d6.firebaseapp.com.firebaseapp.com",
  projectId: "studio-6823834543-894d6",
  messagingSenderId: "478113508667",
  appId: "1:478113508667:web:ef4f07ca0b76dfc2109b1e",
});

const messaging = firebase.messaging();


/* =====================================================
 * 🔔 Background Message Handler (핵심)
 * ===================================================== */

messaging.onBackgroundMessage((payload) => {

  // ⚠️ 웹 FCM은 data payload 기준
  const title = payload.data?.title ?? "🍽️ 점심 투표 시간입니다";
  const options = {
    body: payload.data?.body ?? "오늘 점심 같이 드시나요?",
    icon: payload.data?.icon ?? "/icon-192.svg",
    badge: "/icon-192.svg",
    tag: "lunch-vote-notification",
    data: payload.data ?? {},
    requireInteraction: false,
  };

  self.registration.showNotification(title, options);
});

/* =====================================================
 * 👆 Notification Click
 * ===================================================== */

self.addEventListener("notificationclick", (event) => {

  event.notification.close();

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if ("focus" in client) {
            return client.focus();
          }
        }
        return clients.openWindow("/");
      }),
  );
});

/* =====================================================
 * (Optional) Minimal Cache (PWA)
 * ===================================================== */

const CACHE_NAME = "lunch-vote-cache-v1";
const STATIC_ASSETS = ["/", "/manifest.json", "/icon-192.svg", "/icon-512.svg"];

self.addEventListener("install", (event) => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {});
    }),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        }),
      ),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request);
    }),
  );
});
