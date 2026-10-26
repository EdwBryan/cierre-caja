// Guarda la app en el celular para que abra rápido y funcione sin internet.
// Al cambiar index.html, sube la versión para forzar la actualización.
var VERSION = 'cierre-v4';
var ARCHIVOS = ['./', 'index.html', 'manifest.json', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) { return c.addAll(ARCHIVOS); }));
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== VERSION; }).map(function (k) { return caches.delete(k); }));
  }));
  self.clients.claim();
});

// Responde desde la caché al instante y actualiza en segundo plano.
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.open(VERSION).then(function (c) {
    return c.match(e.request).then(function (enCache) {
      var red = fetch(e.request).then(function (resp) {
        if (resp.ok) c.put(e.request, resp.clone());
        return resp;
      }).catch(function () { return enCache; });
      return enCache || red;
    });
  }));
});
