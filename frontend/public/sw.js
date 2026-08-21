const CACHE_NAME = 'freshlife-v1';

// Install event - cache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        './',
        './icon.svg',
        './models/best.onnx',
        './models/mobilenet.onnx',
        './models/imagenet_classes.json',
        './wasm/ort-wasm.wasm',
        './wasm/ort-wasm-threaded.wasm',
        './wasm/ort-wasm-simd.wasm',
        './wasm/ort-wasm-simd-threaded.wasm'
      ]);
    })
  );
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - Serve from cache first, then network
self.addEventListener('fetch', (event) => {
  // We only want to handle GET requests
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((fetchResponse) => {
        return caches.open(CACHE_NAME).then((cache) => {
          // Cache new responses for offline usage
          if (fetchResponse.status === 200) {
            cache.put(event.request, fetchResponse.clone());
          }
          return fetchResponse;
        });
      });
    }).catch(() => {
      // Offline fallback
      return new Response('Offline mode');
    })
  );
});
