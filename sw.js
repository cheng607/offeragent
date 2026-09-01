/**
 * OfferAgent · Service Worker
 * 安装时缓存核心静态资源，采用 Cache-First 策略，支持离线访问。
 * 每次发布新版本时递增 CACHE_NAME。
 */
var CACHE_NAME = 'offeragent-v3';
var ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/config.js',
  './js/bank-extra.js',
  './js/bank.js',
  './js/storage.js',
  './js/scheduler.js',
  './js/stats.js',
  './js/charts.js',
  './js/app.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(ASSETS);
    }).then(function () {
      return self.skipWaiting();
    }).catch(function (err) {
      console.warn('[OfferAgent SW] install cache failed:', err);
    })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== CACHE_NAME; })
          .map(function (k) { return caches.delete(k); })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  if (e.request.url.startsWith('chrome-extension://')) return;

  e.respondWith(
    caches.match(e.request).then(function (cached) {
      if (cached) return cached;

      return fetch(e.request).then(function (res) {
        if (!res || res.status !== 200 || res.type !== 'basic') {
          return res;
        }
        if (new URL(e.request.url).origin !== self.location.origin) {
          return res;
        }
        var clone = res.clone();
        caches.open(CACHE_NAME).then(function (cache) {
          cache.put(e.request, clone);
        });
        return res;
      });
    })
  );
});
