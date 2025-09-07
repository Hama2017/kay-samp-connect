const CACHE_NAME = 'kaaysamp-v1.0.0';
const STATIC_CACHE = 'kaaysamp-static-v1.0.0';
const DYNAMIC_CACHE = 'kaaysamp-dynamic-v1.0.0';

// Assets à mettre en cache immédiatement
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/offline.html',
  // Ajoutez ici d'autres assets critiques
];

// URLs à mettre en cache de manière dynamique
const CACHE_STRATEGIES = {
  // Images - Cache First avec fallback
  images: /\.(jpg|jpeg|png|gif|webp|svg)$/i,
  // API - Network First avec fallback cache
  api: /\/api\//,
  // Assets statiques - Cache First
  static: /\.(js|css|woff|woff2|ttf|eot)$/i,
};

// Installation du Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Installation complete');
        return self.skipWaiting();
      })
  );
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Activation complete');
        return self.clients.claim();
      })
  );
});

// Stratégies de cache
function cacheFirst(request) {
  return caches.match(request)
    .then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(request)
        .then((fetchResponse) => {
          if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
            return fetchResponse;
          }
          const responseToCache = fetchResponse.clone();
          caches.open(DYNAMIC_CACHE)
            .then((cache) => {
              cache.put(request, responseToCache);
            });
          return fetchResponse;
        });
    });
}

function networkFirst(request) {
  return fetch(request)
    .then((fetchResponse) => {
      if (fetchResponse && fetchResponse.status === 200) {
        const responseToCache = fetchResponse.clone();
        caches.open(DYNAMIC_CACHE)
          .then((cache) => {
            cache.put(request, responseToCache);
          });
      }
      return fetchResponse;
    })
    .catch(() => {
      return caches.match(request);
    });
}

function staleWhileRevalidate(request) {
  const cachedResponsePromise = caches.match(request);
  const networkResponsePromise = fetch(request)
    .then((fetchResponse) => {
      if (fetchResponse && fetchResponse.status === 200) {
        const responseToCache = fetchResponse.clone();
        caches.open(DYNAMIC_CACHE)
          .then((cache) => {
            cache.put(request, responseToCache);
          });
      }
      return fetchResponse;
    })
    .catch(() => null);

  return cachedResponsePromise
    .then((cachedResponse) => {
      return cachedResponse || networkResponsePromise;
    });
}

// Interception des requêtes
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorer les requêtes non-HTTP
  if (!request.url.startsWith('http')) return;

  // Stratégie par défaut: Stale While Revalidate pour la navigation
  if (request.mode === 'navigate') {
    event.respondWith(
      staleWhileRevalidate(request)
        .catch(() => {
          return caches.match('/offline.html');
        })
    );
    return;
  }

  // Images: Cache First
  if (CACHE_STRATEGIES.images.test(url.pathname)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Assets statiques: Cache First
  if (CACHE_STRATEGIES.static.test(url.pathname)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // API: Network First
  if (CACHE_STRATEGIES.api.test(url.pathname)) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Autres requêtes: Stale While Revalidate
  event.respondWith(staleWhileRevalidate(request));
});

// Gestion des messages du client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// Notifications Push (pour plus tard)
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: data.tag || 'default',
    requireInteraction: false,
    actions: [
      {
        action: 'view',
        title: 'Voir',
        icon: '/icons/action-view.png'
      },
      {
        action: 'close',
        title: 'Fermer',
        icon: '/icons/action-close.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Gestion des clics sur notifications
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow(event.notification.data?.url || '/')
    );
  }
});