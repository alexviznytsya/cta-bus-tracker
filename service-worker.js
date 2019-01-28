var CACHE_NAME = 'the-bit-project-cache-v1';
var urlsToCache = [
  '',
  'about.html',
  'index.html',
  'manage-favorites.html',
  'manifest.json',
  'search-results.html',
  'search.html',
  'settings.html',
  'tracker.html',
  'images/favicon.ico',
  'images/position.jpg',
  'css/main.css',
  'css/libraries/material-compoinents-icons.css',
  'css/libraries/material-components-web.min.css',
  'css/libraries/mc-icons.ttf',
  'js/about.js',
  'js/index.js',
  'js/search.js',
  'js/settings.js',
  'js/tracker.js',
  'js/libraries/dexie.min.js',
  'js/libraries/jquery-3.3.1.min.js',
  'js/libraries/material-components-web.min.js'
];

// Install Service Worker:
self.addEventListener('install', function (event) {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function (cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Get file from network and cache it.
// If network is not avaivable return last cached version of file:
self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.open(CACHE_NAME).then(function(cache) {
      return fetch(event.request).then(function(response) {
        cache.put(event.request, response.clone());
        return response;
      }).catch(function() {
        return caches.match(event.request);
      })
    })
  );
})
   