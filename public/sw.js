// BuildWise Service Worker v2.1.0
// Production-quality service worker with offline support

const CACHE_VERSION = 'v2';
const STATIC_CACHE = `buildwise-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `buildwise-dynamic-${CACHE_VERSION}`;

// Flag to track whether activation (cache cleanup) has completed.
// Fetch events arriving before this is true will fall back to network-only.
// The activate event handler sets this to true after cleanup finishes.
// Note: This script only evaluates on fresh install or update, so the
// initial false value is always correct — the activate event will fire.
let activationComplete = false;
const OFFLINE_PAGE = '/offline.html';

// Static assets to cache immediately on install
// These are always available offline
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/offline.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
];

// File extensions that should use cache-first strategy
const CACHE_FIRST_EXTENSIONS = [
  '.js',
  '.css',
  '.woff',
  '.woff2',
  '.ttf',
  '.eot',
  '.ico',
  '.png',
  '.jpg',
  '.jpeg',
  '.svg',
  '.gif',
  '.webp',
];

// ============================================
// INSTALL EVENT
// Cache static assets immediately
// ============================================
self.addEventListener('install', (event) => {
  console.log('[SW] Installing BuildWise service worker v2.1...');

  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Pre-caching static assets');
        // Use addAll for atomic caching - if one fails, all fail
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Static assets cached successfully');
        // Activate immediately without waiting for old SW to finish
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Failed to cache static assets:', error);
      })
  );
});

// ============================================
// ACTIVATE EVENT
// Clean up old caches, take control of clients
// ============================================
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating BuildWise service worker v2.1...');

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              // Delete caches that don't match current version
              return cacheName.startsWith('buildwise-') &&
                     cacheName !== STATIC_CACHE &&
                     cacheName !== DYNAMIC_CACHE;
            })
            .map((cacheName) => {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('[SW] Old caches cleaned up');
        // Mark activation complete BEFORE claiming clients so that
        // any fetch events triggered by claim() see the flag as true.
        activationComplete = true;
        // Take control of all open clients immediately
        return self.clients.claim();
      })
  );
});

// ============================================
// FETCH EVENT
// Intercept network requests and serve from cache
// ============================================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests (POST, PUT, DELETE, etc.)
  if (request.method !== 'GET') {
    return;
  }

  // Skip non-HTTP(S) requests (chrome-extension://, etc.)
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Guard: if activation hasn't completed (cache cleanup still in progress),
  // fall back to network-only to avoid reading stale/missing caches.
  if (!activationComplete) {
    event.respondWith(fetch(request));
    return;
  }

  // Skip cross-origin requests (external APIs, CDNs handled separately)
  const isSameOrigin = url.origin === self.location.origin;

  // ----------------------------------------
  // Strategy 1: API calls - Network only with offline fallback
  // ----------------------------------------
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // ----------------------------------------
  // Strategy 2: Navigation - Network first with offline fallback
  // ----------------------------------------
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request));
    return;
  }

  // ----------------------------------------
  // Strategy 3: Static assets - Cache first with network fallback
  // ----------------------------------------
  if (isSameOrigin && isCacheFirstAsset(url.pathname)) {
    event.respondWith(handleStaticAssetRequest(request));
    return;
  }

  // ----------------------------------------
  // Strategy 4: Everything else - Network first
  // ----------------------------------------
  event.respondWith(handleDefaultRequest(request));
});

// ============================================
// REQUEST HANDLERS
// ============================================

/**
 * Handle API requests - Network only, cache response for offline
 */
async function handleApiRequest(request) {
  try {
    const response = await fetch(request);

    // Cache successful API responses for offline fallback
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
      trimCache(DYNAMIC_CACHE, MAX_DYNAMIC_CACHE_ENTRIES);
    }

    return response;
  } catch (error) {
    console.log('[SW] API request failed, checking cache:', request.url);

    // Try to return cached API response
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('[SW] Returning cached API response');
      return cachedResponse;
    }

    // Return offline JSON response
    return new Response(
      JSON.stringify({
        error: 'offline',
        message: 'You are offline. Please check your connection.'
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * Handle navigation requests - Network first, offline fallback
 */
async function handleNavigationRequest(request) {
  try {
    const response = await fetch(request);

    // Cache the page for offline access
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
      trimCache(DYNAMIC_CACHE, MAX_DYNAMIC_CACHE_ENTRIES);
    }

    return response;
  } catch (error) {
    console.log('[SW] Navigation failed, checking cache:', request.url);

    // Try to return cached page
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('[SW] Returning cached page');
      return cachedResponse;
    }

    // Return offline page as last resort
    console.log('[SW] Returning offline page');
    const offlinePage = await caches.match(OFFLINE_PAGE);
    if (offlinePage) {
      return offlinePage;
    }

    // Fallback if offline page not cached (shouldn't happen)
    return new Response(
      '<!DOCTYPE html><html><head><title>Offline</title></head><body><h1>You are offline</h1><p>Please check your internet connection.</p></body></html>',
      { headers: { 'Content-Type': 'text/html' } }
    );
  }
}

/**
 * Handle static assets - Cache first, network fallback
 */
async function handleStaticAssetRequest(request) {
  // Check cache first
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    // Return cached version immediately
    // Also fetch fresh version in background to update cache
    fetchAndCache(request);
    return cachedResponse;
  }

  // Not in cache, fetch from network
  return fetchAndCache(request);
}

/**
 * Handle default requests - Network first
 */
async function handleDefaultRequest(request) {
  try {
    const response = await fetch(request);

    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
      trimCache(DYNAMIC_CACHE, MAX_DYNAMIC_CACHE_ENTRIES);
    }

    return response;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return placeholder for images
    if (request.destination === 'image') {
      return createOfflineImagePlaceholder();
    }

    throw error;
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

const MAX_DYNAMIC_CACHE_ENTRIES = 50;

/**
 * Trim a cache to a maximum number of entries (LRU-style: oldest inserted first)
 */
async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxEntries) {
    // Delete oldest entries (those inserted first) until we're at the limit
    const deleteCount = keys.length - maxEntries;
    for (let i = 0; i < deleteCount; i++) {
      await cache.delete(keys[i]);
    }
    console.log(`[SW] Trimmed ${deleteCount} entries from ${cacheName}`);
  }
}

/**
 * Check if URL should use cache-first strategy
 */
function isCacheFirstAsset(pathname) {
  return CACHE_FIRST_EXTENSIONS.some(ext => pathname.endsWith(ext));
}

/**
 * Fetch from network and cache the response
 */
async function fetchAndCache(request) {
  try {
    const response = await fetch(request);

    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.log('[SW] Fetch failed for:', request.url);

    // Return placeholder for images
    if (request.destination === 'image') {
      return createOfflineImagePlaceholder();
    }

    throw error;
  }
}

/**
 * Create SVG placeholder for offline images
 */
function createOfflineImagePlaceholder() {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
      <rect fill="#1e3a5f" width="200" height="200"/>
      <text fill="#ffffff" font-family="system-ui, sans-serif" font-size="14" text-anchor="middle" x="100" y="95">
        Image
      </text>
      <text fill="#94a3b8" font-family="system-ui, sans-serif" font-size="12" text-anchor="middle" x="100" y="115">
        Offline
      </text>
    </svg>
  `.trim();

  return new Response(svg, {
    headers: { 'Content-Type': 'image/svg+xml' }
  });
}

// ============================================
// MESSAGE HANDLER
// Communication with the main app
// ============================================
self.addEventListener('message', (event) => {
  console.log('[SW] Received message:', event.data);

  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }

  if (event.data === 'getVersion') {
    if (event.ports && event.ports[0]) {
      event.ports[0].postMessage({ version: CACHE_VERSION });
    }
  }

  if (event.data === 'clearCache') {
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter(name => name.startsWith('buildwise-'))
          .map(name => caches.delete(name))
      );
    }).then(() => {
      if (event.ports && event.ports[0]) {
        event.ports[0].postMessage({ cleared: true });
      }
    });
  }
});

// ============================================
// BACKGROUND SYNC (for future use)
// ============================================
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);

  if (event.tag === 'sync-data') {
    event.waitUntil(
      // Future: sync offline changes when back online
      Promise.resolve()
    );
  }
});

console.log('[SW] BuildWise service worker v2.1 loaded');
