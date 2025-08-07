const CACHE_NAME = 'haus-of-basquiat-v1.0.0';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';

// Files to cache immediately
const STATIC_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// API routes to cache
const API_ROUTES = [
  '/api/auth/profile',
  '/api/users',
  '/api/posts',
  '/api/documents',
  '/api/chat/threads'
];

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('Service Worker installed');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle static file requests
  if (request.method === 'GET') {
    event.respondWith(handleStaticRequest(request));
    return;
  }
});

// Handle API requests with network-first strategy
async function handleApiRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache:', error);
    
    // Fallback to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline response for specific routes
    if (request.url.includes('/api/posts')) {
      return new Response(JSON.stringify({
        posts: [],
        message: 'You are offline. Posts will load when connection is restored.'
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    throw error;
  }
}

// Handle static file requests with cache-first strategy
async function handleStaticRequest(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Static file fetch failed:', error);
    
    // Return offline page for HTML requests
    if (request.headers.get('accept').includes('text/html')) {
      return caches.match('/offline.html');
    }
    
    throw error;
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync-posts') {
    event.waitUntil(syncOfflinePosts());
  }
  
  if (event.tag === 'background-sync-messages') {
    event.waitUntil(syncOfflineMessages());
  }
});

// Sync offline posts when connection is restored
async function syncOfflinePosts() {
  try {
    const db = await openDB();
    const offlinePosts = await db.getAll('offlinePosts');
    
    for (const post of offlinePosts) {
      try {
        const response = await fetch('/api/posts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${post.token}`
          },
          body: JSON.stringify(post.data)
        });
        
        if (response.ok) {
          await db.delete('offlinePosts', post.id);
        }
      } catch (error) {
        console.log('Failed to sync post:', error);
      }
    }
  } catch (error) {
    console.log('Background sync failed:', error);
  }
}

// Sync offline messages when connection is restored
async function syncOfflineMessages() {
  try {
    const db = await openDB();
    const offlineMessages = await db.getAll('offlineMessages');
    
    for (const message of offlineMessages) {
      try {
        const response = await fetch('/api/chat/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${message.token}`
          },
          body: JSON.stringify(message.data)
        });
        
        if (response.ok) {
          await db.delete('offlineMessages', message.id);
        }
      } catch (error) {
        console.log('Failed to sync message:', error);
      }
    }
  } catch (error) {
    console.log('Background sync failed:', error);
  }
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  const options = {
    body: event.data ? event.data.text() : 'New notification from Haus of Basquiat',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/xmark.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Haus of Basquiat', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// IndexedDB helper
async function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('HausOfBasquiatDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create object stores
      if (!db.objectStoreNames.contains('offlinePosts')) {
        db.createObjectStore('offlinePosts', { keyPath: 'id', autoIncrement: true });
      }
      
      if (!db.objectStoreNames.contains('offlineMessages')) {
        db.createObjectStore('offlineMessages', { keyPath: 'id', autoIncrement: true });
      }
      
      if (!db.objectStoreNames.contains('userData')) {
        db.createObjectStore('userData', { keyPath: 'key' });
      }
    };
  });
}

// Message handling for communication with main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker received message:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(DYNAMIC_CACHE)
        .then((cache) => {
          return cache.addAll(event.data.urls);
        })
    );
  }
});

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  console.log('Periodic background sync:', event);
  
  if (event.tag === 'content-sync') {
    event.waitUntil(syncContent());
  }
});

// Sync content periodically
async function syncContent() {
  try {
    // Sync posts
    const postsResponse = await fetch('/api/posts?limit=20');
    if (postsResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put('/api/posts?limit=20', postsResponse.clone());
    }
    
    // Sync documents
    const docsResponse = await fetch('/api/documents');
    if (docsResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put('/api/documents', docsResponse.clone());
    }
  } catch (error) {
    console.log('Periodic sync failed:', error);
  }
}