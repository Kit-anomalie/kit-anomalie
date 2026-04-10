const CACHE_NAME = 'kit-anomalie-v0.6.0'

const PRECACHE_URLS = [
  '/kit-anomalie/',
  '/kit-anomalie/index.html',
  '/kit-anomalie/manifest.json',
  '/kit-anomalie/icons/icon-192.svg',
  '/kit-anomalie/icons/icon-512.svg',
  '/kit-anomalie/favicon.svg',
]

// Installation : precache les ressources essentielles
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS)
    })
  )
  self.skipWaiting()
})

// Activation : nettoie les anciens caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    })
  )
  self.clients.claim()
})

// Fetch : cache-first pour les assets, network-first pour la navigation
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  // Ne pas cacher les requetes version.json et maintenance.json (toujours frais)
  if (url.pathname.includes('version.json') || url.pathname.includes('maintenance.json')) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    )
    return
  }

  // Pour les fichiers JS/CSS avec hash (assets Vite) : cache-first
  if (url.pathname.match(/\/assets\/.*\.[a-f0-9]+\./)) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached
        return fetch(event.request).then((response) => {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
          return response
        })
      })
    )
    return
  }

  // Pour tout le reste : network-first, fallback cache
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone()
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
        return response
      })
      .catch(() => {
        return caches.match(event.request).then((cached) => {
          // Si pas en cache et navigation, retourner index.html (SPA)
          if (!cached && event.request.mode === 'navigate') {
            return caches.match('/kit-anomalie/index.html')
          }
          return cached
        })
      })
  )
})
