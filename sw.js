/**
 * ============================================================================
 * QC PORTAL — SERVICE WORKER (PWA OFFLINE CACHE & PROPER 503 OFFLINE SIGNAL)
 * ============================================================================
 */

const CACHE_NAME = 'qc-ncr-portal-cache-v2';
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
  // Kembalikan HTTP 503 saat gagal agar app.js langsung memicu penyimpanan ke Antrean Offline IndexedDB
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

  // Hanya tangani request GET untuk aset statis lokal
  if (event.request.method !== 'GET') return;

  // Untuk aset lokal, gunakan Cache First dengan pembaruan latar belakang (Stale-While-Revalidate)
  event.respondWith(
    caches.match(event.request).then(function(cachedResponse) {
      if (cachedResponse) {
        fetch(event.request).then(function(networkResponse) {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then(function(cache) {
              cache.put(event.request, networkResponse);
            });
          }
        }).catch(function() {
          // Abaikan error saat memperbarui cache di mode offline
        });

        return cachedResponse;
      }

      return fetch(event.request).then(function(networkResponse) {
        return networkResponse;
      }).catch(function() {
        const acceptHeader = event.request.headers.get('accept') || '';
        if (acceptHeader.includes('text/html')) {
          return caches.match('./index.html');
        }
      });
    })
  );
});
