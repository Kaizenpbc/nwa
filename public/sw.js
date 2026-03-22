const CACHE = 'nwa-v1';
const PRECACHE = ['/manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(clients.claim());
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (PRECACHE.includes(url.pathname)) {
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
  }
});

self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : { title: 'NWA Alert', body: 'New road update available.' };
  e.waitUntil(self.registration.showNotification(data.title, {
    body: data.body,
    icon: '/icons/icon-192.svg',
    badge: '/icons/icon-192.svg',
    data: { url: data.url || '/' },
    tag: 'nwa-alert',
    renotify: true,
  }));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({ type: 'window' }).then(list => {
    const target = e.notification.data?.url || '/';
    for (const c of list) {
      if (c.url === target && 'focus' in c) return c.focus();
    }
    return clients.openWindow(target);
  }));
});
