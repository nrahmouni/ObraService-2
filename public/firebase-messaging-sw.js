// ObraService Pro - Background Service Worker for Firebase Cloud Messaging & Push Notifications
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

// Initialize Firebase in Service Worker if config exists
self.addEventListener('push', function(event) {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch (e) {
    payload = {
      notification: {
        title: 'ObraService Pro Alerta',
        body: event.data.text(),
      }
    };
  }

  const notificationTitle = payload.notification?.title || payload.title || 'Alerta de Obra — ObraService Pro';
  const notificationOptions = {
    body: payload.notification?.body || payload.body || 'Tienes una nueva actualización en tu obra asignada.',
    icon: '/pwa-192x192.png',
    badge: '/favicon.svg',
    tag: payload.data?.tag || 'obraservice-alert',
    data: payload.data || {},
    actions: [
      { action: 'open_app', title: 'Abrir ObraService' },
      { action: 'dismiss', title: 'Entendido' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(notificationTitle, notificationOptions)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
