// ===== PRAYED Service Worker =====
// Offline-first architecture: cache-first for static, network-first for API

const CACHE_NAME = 'prayed-v7';
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/variables.css',
  './css/base.css',
  './css/components.css',
  './css/screens.css',
  './css/bible.css',
  './css/prayer-room.css',
  './css/dark-mode.css',
  './js/imgmap-generated.js',
  './js/config.js',
  './js/weather.js',
  './js/places.js',
  './js/ui.js',
  './js/auth.js',
  './js/habits.js',
  './js/home.js',
  './js/pray.js',
  './js/circles.js',
  './js/bible.js',
  './js/profile.js',
  './js/prayer-room.js',
  './js/app.js',
  './js/i18n.js',
  './data/prayers/en.json',
  './data/prayers/es.json',
  './data/prayers/tl.json'
];

// Audio assets (cached lazily on first use via cache-first fetch strategy)
const AUDIO_ASSETS = [
  './audio/rosary/prayers/sign-of-cross.mp3',
  './audio/rosary/prayers/apostles-creed.mp3',
  './audio/rosary/prayers/our-father.mp3',
  './audio/rosary/prayers/hail-mary.mp3',
  './audio/rosary/prayers/glory-be.mp3',
  './audio/rosary/prayers/hail-holy-queen.mp3',
  './audio/rosary/prayers/intro.mp3'
];

// Image assets to cache on first load
const IMG_ASSETS = [
  './img/hcfm_logo_blue.webp',
  './img/hcfm_logo_white.webp',
  './img/earth_globe.webp',
  './img/rosary_stock.webp',
  './img/mass_01.webp',
  './img/stained_glass.webp',
  './img/family_table_prayer.webp',
  './img/church_interior.webp',
  './img/prayer_stock1.webp',
  './img/prayer_stock3.webp'
];

// Install: cache static assets
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      // Cache static assets first (critical path)
      return cache.addAll(STATIC_ASSETS).then(function() {
        // Then cache images (non-blocking, fail silently)
        return Promise.allSettled(
          IMG_ASSETS.map(function(url) {
            return cache.add(url).catch(function() {
              console.warn('SW: Could not cache image:', url);
            });
          })
        );
      });
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

// Activate: clean old caches
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; })
            .map(function(k) { return caches.delete(k); })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// Fetch strategy
self.addEventListener('fetch', function(event) {
  var url = new URL(event.request.url);

  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip Firebase/Firestore/Auth API requests (they handle their own caching)
  if (url.hostname.includes('firebaseio.com') ||
      url.hostname.includes('googleapis.com') ||
      url.hostname.includes('gstatic.com') ||
      url.hostname.includes('firebase') ||
      url.hostname.includes('identitytoolkit')) {
    return;
  }

  // Bible API (bolls.life) - Network first, cache fallback
  if (url.hostname === 'bolls.life') {
    event.respondWith(
      fetch(event.request).then(function(response) {
        if (response.ok) {
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, clone);
          });
        }
        return response;
      }).catch(function() {
        return caches.match(event.request);
      })
    );
    return;
  }

  // Weather API (Open-Meteo) - Network first, cache fallback
  if (url.hostname.includes('open-meteo.com')) {
    event.respondWith(
      fetch(event.request).then(function(response) {
        if (response.ok) {
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, clone);
          });
        }
        return response;
      }).catch(function() {
        return caches.match(event.request);
      })
    );
    return;
  }

  // Overpass API (churches) - Network first, cache fallback
  if (url.hostname.includes('overpass')) {
    event.respondWith(
      fetch(event.request).then(function(response) {
        if (response.ok) {
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, clone);
          });
        }
        return response;
      }).catch(function() {
        return caches.match(event.request);
      })
    );
    return;
  }

  // Google Fonts - Cache first (they don't change)
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(
      caches.match(event.request).then(function(cached) {
        if (cached) return cached;
        return fetch(event.request).then(function(response) {
          if (response.ok) {
            var clone = response.clone();
            caches.open(CACHE_NAME).then(function(cache) {
              cache.put(event.request, clone);
            });
          }
          return response;
        });
      })
    );
    return;
  }

  // Audio files - Cache first (large, static files)
  if (url.pathname.includes('/audio/')) {
    event.respondWith(
      caches.match(event.request).then(function(cached) {
        if (cached) return cached;
        return fetch(event.request).then(function(response) {
          if (response.ok) {
            var clone = response.clone();
            caches.open(CACHE_NAME).then(function(cache) {
              cache.put(event.request, clone);
            });
          }
          return response;
        });
      })
    );
    return;
  }

  // Static assets (same-origin) - Network first, cache fallback
  // This ensures users always get the latest version when online
  if (url.origin === self.location.origin) {
    event.respondWith(
      fetch(event.request).then(function(response) {
        if (response.ok) {
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, clone);
          });
        }
        return response;
      }).catch(function() {
        return caches.match(event.request);
      })
    );
    return;
  }

  // Everything else - network with cache fallback
  event.respondWith(
    fetch(event.request).catch(function() {
      return caches.match(event.request);
    })
  );
});

// Push notifications
self.addEventListener('push', function(event) {
  var data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch(e) {
    data = { body: event.data ? event.data.text() : 'Time to pray together' };
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'PRAYED', {
      body: data.body || 'Time to pray together',
      icon: './img/hcfm_logo_blue.webp',
      badge: './img/hcfm_logo_blue.webp',
      tag: 'prayer-notification',
      data: data
    })
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then(function(windowClients) {
      for (var i = 0; i < windowClients.length; i++) {
        if ('focus' in windowClients[i]) return windowClients[i].focus();
      }
      return self.clients.openWindow('./');
    })
  );
});
