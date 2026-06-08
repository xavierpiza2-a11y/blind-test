const CACHE = 'blindtest-v2';
const ASSETS = [
  '/blind-test/',
  '/blind-test/index.html',
  '/blind-test/manifest.json'
];

// Installation — mise en cache des ressources de base
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

// Activation — nettoyage des anciens caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch — réseau en priorité, cache en fallback
self.addEventListener('fetch', e => {
  // On ne cache pas les requêtes Firebase (temps réel)
  if (e.request.url.includes('firebasedatabase') ||
      e.request.url.includes('googleapis') ||
      e.request.url.includes('deezer.com') ||
      e.request.url.includes('gstatic.com')) {
    return;
  }
  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Mettre en cache la réponse fraîche
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
