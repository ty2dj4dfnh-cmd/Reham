// DentalMind Service Worker
const CACHE_NAME = 'dentalmind-cache-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

// Real Notification Click Handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Push Notification Handling
self.addEventListener('push', (event) => {
  let payload = {
    title: 'DentalMind Study Reminder',
    body: 'Time to check your daily dental study plan.',
  };

  try {
    if (event.data) {
      payload = event.data.json();
    }
  } catch (e) {
    if (event.data) {
      payload.body = event.data.text();
    }
  }

  const options = {
    body: payload.body,
    icon: '/assets/icon-192.svg',
    badge: '/assets/icon-192.svg',
    vibrate: [100, 50, 100],
    data: {
      url: payload.url || '/',
    },
  };

  event.waitUntil(self.registration.showNotification(payload.title, options));
});
