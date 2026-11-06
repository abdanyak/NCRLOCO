/**
 * ============================================================================
 * QC PORTAL — SERVICE WORKER (PWA OFFLINE CACHE)
 * ============================================================================
 */

const CACHE_NAME = 'qc-ncr-portal-cache-v1';
const ASSETS_TO_CACHE = [
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.jpg',
  './UGL2.jpg'
];

// 1. INSTALL SERVICE WORKER & CACHE ASET STATIS
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

// 2. ACTIVATE & BERSIHKAN CACHE LAMA
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// 3. FETCH STRATEGY: STALE-WHILE-REVALIDATE / NETWORK FIRST
self.addEventListener('fetch', function(event) {
  const url = new URL(event.request.url);

  // Jika permintaan mengarah ke Google Apps Script API, selalu ambil dari jaringan (Network First)
  if (url.origin.includes('script.google.com')) {
  event.respondWith(
    fetch(event.request).catch(function() {
      return new Response(
        JSON.stringify({ status: 'offline', message: 'Mode offline aktif.' }),
        {
          status: 503,
          statusText: 'Service Unavailable',
          headers: { 'Content-Type': 'application/json' }
        }
      );
    })
  );
  return;
}

  // Untuk aset lokal, gunakan Cache First, fallback ke Network
  event.respondWith(
    caches.match(event.request).then(function(cachedResponse) {
      if (cachedResponse) {
        // Ambil pembaruan di latar belakang jika online
        fetch(event.request).then(function(networkResponse) {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then(function(cache) {
              cache.put(event.request, networkResponse);
            });
          }
        }).catch(function() {/* Mengabaikan error saat offline */});
        
        return cachedResponse;
      }

      return fetch(event.request).then(function(networkResponse) {
        return networkResponse;
      }).catch(function() {
        if (event.request.headers.get('accept').includes('text/html')) {
          return caches.match('./index.html');
        }
      });
    })
  );
});
