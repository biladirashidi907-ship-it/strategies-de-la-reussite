// ============================================
// ESTRA LINK - SERVICE WORKER (PWA)
// Version : 2.0.0
// ============================================

const CACHE_NAME = 'estra-link-v4';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/home.html',
  '/login.html',
  '/settings.html',
  '/account-select.html',
  '/about.html',
  '/terms.html',
  '/privacy.html',
  '/help.html',
  '/events.html',
  '/groups.html',
  '/group-detail.html',
  '/friends.html',
  '/courses.html',
  '/saved.html',
  '/messages.html',
  '/notifications.html',
  '/profile.html',
  '/mentorship.html',
  '/404.html',
  '/offline.html',
  '/admin.html',
  '/css/global.css',
  '/js/utils/limits.js',
  '/js/utils/i18n.js',
  '/js/utils/validators.js',
  '/js/utils/logger.js',
  '/js/utils/socket.js',
  '/js/core/estra-sdk.js',
  '/js/core/constants.js',
  '/js/core/storage.js',
  '/js/core/app.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css',
  'https://ui-avatars.com/api/?background=38bdf8&color=fff&name=E&size=96',
  'https://ui-avatars.com/api/?background=38bdf8&color=fff&name=E&size=72',
  'https://ui-avatars.com/api/?background=38bdf8&color=fff&name=E&size=152'
];

// ============ INSTALLATION ============
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Installation v4');
  event.waitUntil(
    caches.open(CACHE_NAME)
    .then((cache) => {
      console.log('📦 Mise en cache des assets statiques');
      return cache.addAll(STATIC_ASSETS).catch(err => {
        console.warn('⚠️ Certains assets n\'ont pas pu être mis en cache:', err);
      });
    })
    .then(() => {
      console.log('✅ Installation terminée');
      return self.skipWaiting();
    })
  );
});

// ============ ACTIVATION ============
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker: Activation v4');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
        .filter((name) => name !== CACHE_NAME)
        .map((name) => {
          console.log('🗑️ Suppression de l\'ancien cache:', name);
          return caches.delete(name);
        })
      );
    }).then(() => {
      console.log('✅ Activation terminée');
      return self.clients.claim();
    })
  );
});

// ============ STRATÉGIE DE CACHE ============
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignorer les requêtes API (futur backend)
  if (url.pathname.startsWith('/api/')) {
    return;
  }
  
  // Ignorer les requêtes chrome-extension
  if (url.protocol === 'chrome-extension:') {
    return;
  }
  
  // Stratégie Network First pour les pages HTML
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(
      fetch(request)
      .then((response) => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseClone);
        });
        return response;
      })
      .catch(() => {
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          // Fallback : page offline
          return caches.match('/offline.html') || caches.match('/404.html');
        });
      })
    );
    return;
  }
  
  // Stratégie Cache First pour les assets statiques
  if (
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'image' ||
    request.destination === 'font' ||
    url.hostname === 'cdnjs.cloudflare.com' ||
    url.hostname === 'ui-avatars.com' ||
    url.hostname === 'unpkg.com' ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.woff2')
  ) {
    event.respondWith(
      caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return fetch(request).then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        });
      })
    );
    return;
  }
  
  // Stratégie par défaut : Network First
  event.respondWith(
    fetch(request)
    .then((response) => {
      const responseClone = response.clone();
      caches.open(CACHE_NAME).then((cache) => {
        cache.put(request, responseClone);
      });
      return response;
    })
    .catch(() => caches.match(request))
  );
});

// ============ NOTIFICATION PUSH ============
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  try {
    const data = event.data.json();
    
    const options = {
      body: data.body || 'Nouvelle notification ESTRA LINK',
      icon: data.icon || 'https://ui-avatars.com/api/?background=38bdf8&color=fff&name=E&size=96',
      badge: data.badge || 'https://ui-avatars.com/api/?background=38bdf8&color=fff&name=E&size=72',
      vibrate: [200, 100, 200],
      tag: data.tag || 'estra-notification',
      data: {
        url: data.url || '/home.html',
        notificationId: data.id || Date.now(),
        type: data.type || 'system'
      },
      requireInteraction: data.requireInteraction || false,
      actions: data.actions || [],
      timestamp: Date.now()
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'ESTRA LINK', options)
    );
    
    console.log('📬 Notification push reçue:', data.title);
  } catch (err) {
    console.error('❌ Erreur notification push:', err);
  }
});

// ============ CLIC SUR NOTIFICATION ============
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const url = event.notification.data?.url || '/home.html';
  const notificationType = event.notification.data?.type || 'system';
  
  console.log('👆 Notification cliquée:', notificationType, url);
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Chercher une fenêtre déjà ouverte
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          client.postMessage({
            type: 'notification_click',
            url: url,
            notificationType: notificationType
          });
          return;
        }
      }
      // Ouvrir une nouvelle fenêtre
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// ============ MESSAGE ENTRE SW ET PAGES ============
self.addEventListener('message', (event) => {
  if (!event.data) return;
  
  switch (event.data.type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'CLEAR_CACHE':
      event.waitUntil(
        caches.delete(CACHE_NAME).then(() => {
          console.log('🗑️ Cache effacé');
        })
      );
      break;
      
    case 'REQUEST_NOTIFICATION_PERMISSION':
      // Le SW ne peut pas demander la permission, c'est la page qui le fait
      console.log('📱 Demande de permission reçue');
      break;
      
    case 'SUBSCRIBE_TO_PUSH':
      // La page demande à s'abonner aux notifications
      console.log('🔔 Demande d\'abonnement push');
      break;
      
    default:
      console.log('📨 Message reçu:', event.data.type);
  }
});

// ============ SYNC EN BACKGROUND ============
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-messages') {
    event.waitUntil(
      // Synchroniser les messages en attente
      console.log('🔄 Synchronisation des messages en arrière-plan')
    );
  }
  
  if (event.tag === 'sync-posts') {
    event.waitUntil(
      // Synchroniser les posts en attente
      console.log('🔄 Synchronisation des posts en arrière-plan')
    );
  }
});

console.log('✅ Service Worker ESTRA LINK v4 prêt !');