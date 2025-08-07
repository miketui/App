class PWAService {
  constructor() {
    this.registration = null;
    this.isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
    this.isOnline = navigator.onLine;
    this.offlineQueue = [];
    
    this.init();
  }

  async init() {
    if (!this.isSupported) {
      console.log('PWA features not supported');
      return;
    }

    // Register service worker
    await this.registerServiceWorker();
    
    // Set up online/offline listeners
    this.setupNetworkListeners();
    
    // Initialize push notifications
    await this.initPushNotifications();
    
    // Set up periodic sync (if supported)
    this.setupPeriodicSync();
  }

  async registerServiceWorker() {
    try {
      this.registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', this.registration);
      
      // Handle updates
      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New content is available
            this.showUpdateNotification();
          }
        });
      });
      
      return this.registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      throw error;
    }
  }

  setupNetworkListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('App is online');
      this.processOfflineQueue();
      this.dispatchEvent('online');
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('App is offline');
      this.dispatchEvent('offline');
    });
  }

  async initPushNotifications() {
    if (!this.registration) return;

    try {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        const subscription = await this.registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(process.env.VITE_VAPID_PUBLIC_KEY)
        });
        
        // Send subscription to server
        await this.sendSubscriptionToServer(subscription);
        console.log('Push notification subscription created');
      }
    } catch (error) {
      console.error('Push notification setup failed:', error);
    }
  }

  setupPeriodicSync() {
    if ('periodicSync' in this.registration) {
      this.registration.periodicSync.register('content-sync', {
        minInterval: 24 * 60 * 60 * 1000 // 24 hours
      }).then(() => {
        console.log('Periodic sync registered');
      }).catch((error) => {
        console.log('Periodic sync registration failed:', error);
      });
    }
  }

  async sendSubscriptionToServer(subscription) {
    try {
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify(subscription)
      });
      
      if (!response.ok) {
        throw new Error('Failed to send subscription to server');
      }
    } catch (error) {
      console.error('Failed to send subscription:', error);
    }
  }

  async sendPushNotification(title, options = {}) {
    if (!this.registration) return;

    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          title,
          ...options
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to send push notification');
      }
    } catch (error) {
      console.error('Failed to send push notification:', error);
    }
  }

  async storeOfflineAction(action, data) {
    if (!this.isOnline) {
      this.offlineQueue.push({ action, data, timestamp: Date.now() });
      this.saveOfflineQueue();
      return { success: false, message: 'Action queued for when you\'re back online' };
    }
    return { success: true };
  }

  async processOfflineQueue() {
    if (this.offlineQueue.length === 0) return;

    console.log('Processing offline queue...');
    
    for (const item of this.offlineQueue) {
      try {
        await this.processOfflineItem(item);
      } catch (error) {
        console.error('Failed to process offline item:', error);
      }
    }
    
    this.offlineQueue = [];
    this.saveOfflineQueue();
  }

  async processOfflineItem(item) {
    switch (item.action) {
      case 'createPost':
        await this.syncPost(item.data);
        break;
      case 'sendMessage':
        await this.syncMessage(item.data);
        break;
      case 'uploadDocument':
        await this.syncDocument(item.data);
        break;
      default:
        console.log('Unknown offline action:', item.action);
    }
  }

  async syncPost(data) {
    const response = await fetch('/api/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify(data)
    });
    
    if (response.ok) {
      console.log('Post synced successfully');
    } else {
      throw new Error('Failed to sync post');
    }
  }

  async syncMessage(data) {
    const response = await fetch('/api/chat/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify(data)
    });
    
    if (response.ok) {
      console.log('Message synced successfully');
    } else {
      throw new Error('Failed to sync message');
    }
  }

  async syncDocument(data) {
    const formData = new FormData();
    formData.append('file', data.file);
    formData.append('metadata', JSON.stringify(data.metadata));
    
    const response = await fetch('/api/documents/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: formData
    });
    
    if (response.ok) {
      console.log('Document synced successfully');
    } else {
      throw new Error('Failed to sync document');
    }
  }

  saveOfflineQueue() {
    localStorage.setItem('offlineQueue', JSON.stringify(this.offlineQueue));
  }

  loadOfflineQueue() {
    const saved = localStorage.getItem('offlineQueue');
    if (saved) {
      this.offlineQueue = JSON.parse(saved);
    }
  }

  showUpdateNotification() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        // Show update notification
        this.dispatchEvent('updateAvailable');
      });
    }
  }

  async checkForUpdates() {
    if (this.registration) {
      await this.registration.update();
    }
  }

  async unregister() {
    if (this.registration) {
      await this.registration.unregister();
      console.log('Service Worker unregistered');
    }
  }

  getAuthToken() {
    // Get auth token from your auth context or localStorage
    return localStorage.getItem('authToken');
  }

  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  dispatchEvent(eventName, data = {}) {
    window.dispatchEvent(new CustomEvent(`pwa:${eventName}`, { detail: data }));
  }

  // Utility methods
  isInstallable() {
    return !window.matchMedia('(display-mode: standalone)').matches && 
           !window.navigator.standalone;
  }

  async installApp() {
    if (this.registration && this.registration.prompt) {
      const result = await this.registration.prompt();
      return result.outcome === 'accepted';
    }
    return false;
  }

  getInstallPrompt() {
    return this.registration ? this.registration.prompt : null;
  }

  // Cache management
  async clearCache() {
    if (this.registration) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('Cache cleared');
    }
  }

  async getCacheSize() {
    if (this.registration) {
      const cacheNames = await caches.keys();
      let totalSize = 0;
      
      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        
        for (const request of keys) {
          const response = await cache.match(request);
          if (response) {
            const blob = await response.blob();
            totalSize += blob.size;
          }
        }
      }
      
      return totalSize;
    }
    return 0;
  }

  // Background sync
  async registerBackgroundSync(tag) {
    if (this.registration && 'sync' in this.registration) {
      await this.registration.sync.register(tag);
      console.log('Background sync registered:', tag);
    }
  }

  // File system access (if supported)
  async requestFileSystemAccess() {
    if ('showOpenFilePicker' in window) {
      try {
        const [fileHandle] = await window.showOpenFilePicker();
        return fileHandle;
      } catch (error) {
        console.error('File system access denied:', error);
        return null;
      }
    }
    return null;
  }

  // Share API
  async share(data) {
    if (navigator.share) {
      try {
        await navigator.share(data);
        return true;
      } catch (error) {
        console.error('Share failed:', error);
        return false;
      }
    }
    return false;
  }

  // Badge API
  async setBadge(count) {
    if ('setAppBadge' in navigator) {
      try {
        await navigator.setAppBadge(count);
      } catch (error) {
        console.error('Failed to set badge:', error);
      }
    }
  }

  async clearBadge() {
    if ('clearAppBadge' in navigator) {
      try {
        await navigator.clearAppBadge();
      } catch (error) {
        console.error('Failed to clear badge:', error);
      }
    }
  }
}

// Create singleton instance
const pwaService = new PWAService();

export default pwaService;