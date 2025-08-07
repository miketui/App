// Service Worker for Haus of Basquiat PWA
const CACHE_NAME = 'haus-of-basquiat-v1.0.0';
const RUNTIME_CACHE = 'runtime-cache-v1';

// Resources to cache on install
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  // Add other static assets as needed
];

// API routes that should be cached
const API_CACHE_PATTERNS = [
  /^\/api\/posts/,
  /^\/api\/documents/,
  /^\/api\/houses/,
  /^\/api\/users/
];

// Routes that should work offline
const OFFLINE_FALLBACK_ROUTES = [
  '/',
  '/chat',
  '/docs',
  '/billing'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        // Skip waiting to activate immediately
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Cache installation failed:', error);
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
            if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        // Take control of all pages immediately
        return self.clients.claim();
      })
  );
});

// Fetch event - handle network requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request));
    return;
  }

  // Handle other requests (assets, etc.)
  event.respondWith(handleAssetRequest(request));
});

// Handle API requests with network-first strategy
async function handleApiRequest(request) {
  const url = new URL(request.url);
  const shouldCache = API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname));

  if (!shouldCache) {
    // For non-cacheable API requests, just try network
    try {
      return await fetch(request);
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Network unavailable' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  try {
    // Try network first
    const response = await fetch(request);
    
    if (response.ok) {
      // Cache successful responses
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    // Network failed, try cache
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline response
    return new Response(JSON.stringify({ 
      error: 'Content unavailable offline',
      offline: true 
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Handle navigation requests
async function handleNavigationRequest(request) {
  try {
    // Try network first
    const response = await fetch(request);
    return response;
  } catch (error) {
    // Network failed, serve cached version or offline fallback
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Serve offline fallback
    const offlinePage = await caches.match('/');
    return offlinePage || new Response('Offline', { status: 503 });
  }
}

// Handle asset requests with cache-first strategy
async function handleAssetRequest(request) {
  // Try cache first
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    // Try network
    const response = await fetch(request);
    
    if (response.ok) {
      // Cache the response
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    // Return a fallback for images
    if (request.destination === 'image') {
      return new Response(
        '<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="200" fill="#f3f4f6"/><text x="100" y="100" text-anchor="middle" fill="#9ca3af">Image unavailable</text></svg>',
        { headers: { 'Content-Type': 'image/svg+xml' } }
      );
    }
    
    throw error;
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);
  
  switch (event.tag) {
    case 'background-sync-posts':
      event.waitUntil(syncPendingPosts());
      break;
    case 'background-sync-messages':
      event.waitUntil(syncPendingMessages());
      break;
    default:
      console.log('Unknown sync tag:', event.tag);
  }
});

// Sync pending posts when online
async function syncPendingPosts() {
  try {
    // Get pending posts from IndexedDB or localStorage
    const pendingPosts = await getPendingPosts();
    
    for (const post of pendingPosts) {
      try {
        const response = await fetch('/api/posts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': post.authToken
          },
          body: JSON.stringify(post.data)
        });
        
        if (response.ok) {
          await removePendingPost(post.id);
          console.log('Synced pending post:', post.id);
        }
      } catch (error) {
        console.error('Failed to sync post:', error);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Sync pending messages when online
async function syncPendingMessages() {
  try {
    // Get pending messages from IndexedDB or localStorage
    const pendingMessages = await getPendingMessages();
    
    for (const message of pendingMessages) {
      try {
        const response = await fetch(`/api/chat/threads/${message.threadId}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': message.authToken
          },
          body: JSON.stringify(message.data)
        });
        
        if (response.ok) {
          await removePendingMessage(message.id);
          console.log('Synced pending message:', message.id);
        }
      } catch (error) {
        console.error('Failed to sync message:', error);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('Push notification received');
  
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (error) {
    console.error('Error parsing push data:', error);
  }
  
  const options = {
    title: data.title || 'Haus of Basquiat',
    body: data.body || 'You have a new notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    tag: data.tag || 'default',
    data: data.data || {},
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/icons/view-icon.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icons/dismiss-icon.png'
      }
    ],
    vibrate: [200, 100, 200],
    requireInteraction: data.requireInteraction || false
  };
  
  event.waitUntil(
    self.registration.showNotification(options.title, options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event.notification.tag);
  
  event.notification.close();
  
  const action = event.action;
  const data = event.notification.data;
  
  if (action === 'dismiss') {
    return;
  }
  
  // Default action or 'view' action
  let url = '/';
  
  if (data.url) {
    url = data.url;
  } else if (data.type === 'message') {
    url = '/chat';
  } else if (data.type === 'post') {
    url = '/';
  }
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window/tab open
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(url);
            return client.focus();
          }
        }
        
        // No existing window, open a new one
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

// Utility functions for offline storage
async function getPendingPosts() {
  // In a real implementation, you would use IndexedDB
  // For now, return empty array
  return [];
}

async function removePendingPost(postId) {
  // Remove from IndexedDB
  console.log('Removing pending post:', postId);
}

async function getPendingMessages() {
  // In a real implementation, you would use IndexedDB
  // For now, return empty array
  return [];
}

async function removePendingMessage(messageId) {
  // Remove from IndexedDB
  console.log('Removing pending message:', messageId);
}

// Handle periodic background sync
self.addEventListener('periodicsync', (event) => {
  console.log('Periodic sync triggered:', event.tag);
  
  switch (event.tag) {
    case 'content-sync':
      event.waitUntil(syncContentInBackground());
      break;
    default:
      console.log('Unknown periodic sync tag:', event.tag);
  }
});

// Sync content in background
async function syncContentInBackground() {
  try {
    // Fetch latest posts and cache them
    const response = await fetch('/api/posts?limit=20');
    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put('/api/posts?limit=20', response.clone());
    }
  } catch (error) {
    console.error('Background content sync failed:', error);
  }
}

// Message handling from main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker received message:', event.data);
  
  switch (event.data.type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
    case 'CACHE_URLS':
      event.waitUntil(cacheUrls(event.data.urls));
      break;
    case 'CLEAR_CACHE':
      event.waitUntil(clearCache());
      break;
    default:
      console.log('Unknown message type:', event.data.type);
  }
});

// Cache specific URLs
async function cacheUrls(urls) {
  const cache = await caches.open(RUNTIME_CACHE);
  return cache.addAll(urls);
}

// Clear all caches
async function clearCache() {
  const cacheNames = await caches.keys();
  return Promise.all(
    cacheNames.map(cacheName => caches.delete(cacheName))
  );
}