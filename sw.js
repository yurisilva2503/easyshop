const CACHE_NAME = "my-cache-v1";
const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "./css/body.css",
  "./css/container.css",
  "./css/form.css",
  "./css/header.css",
  "./css/mediaquery.css",
  "./css/styles.css",
  "./css/sweetalert2.min.css",
  "./css/table.css",
  "./js/sweetalert2.min.js",
  "./js/app.js",
  "./assets/img/background-header.png",
  "./assets/img/favicon.ico",
  "./assets/img/icon144.png",
  "./assets/img/icon192.png",
  "./assets/img/icon512.png",
  "./assets/img/logo.png",
  "./assets/img/screenshot.jpeg",
  "./assets/img/screenshot_2.png",
];

self.addEventListener("install", event => {
  console.log("[ServiceWorker] Install");
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("[ServiceWorker] Caching app shell");
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

self.addEventListener("activate", event => {
  console.log("[ServiceWorker] Activate");
  event.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(
        keyList.map(key => {
          if (key !== CACHE_NAME) {
            console.log("[ServiceWorker] Removing old cache", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener("fetch", event => {
  console.log("[ServiceWorker] Fetch", event.request.url);
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
