// SW Kit Anomalie — rev 2 (force réinstall pour purger anciens caches)
const APP_PREFIX = 'kit-anomalie-'

// Installation : purge tout + precache frais. skipWaiting pour activer tout de suite.
self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    // 1. Purge préventive de tous les anciens caches app
    const oldKeys = await caches.keys()
    await Promise.all(
      oldKeys.filter(k => k.startsWith(APP_PREFIX)).map(k => caches.delete(k))
    )
    // 2. Precache la version courante
    const res = await fetch('/kit-anomalie/version.json', { cache: 'no-store' })
    const data = await res.json()
    const cache = await caches.open(APP_PREFIX + data.v)
    await cache.addAll([
      '/kit-anomalie/',
      '/kit-anomalie/index.html',
      '/kit-anomalie/manifest.json',
      '/kit-anomalie/icons/icon-192.svg',
      '/kit-anomalie/icons/icon-512.svg',
      '/kit-anomalie/favicon.svg',
    ])
  })())
  self.skipWaiting()
})

// Activation : nettoie les anciens caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      fetch('/kit-anomalie/version.json').then(r => r.json()),
      caches.keys(),
    ]).then(([data, keys]) => {
      const currentCache = APP_PREFIX + data.v
      return Promise.all(
        keys
          .filter((key) => key.startsWith(APP_PREFIX) && key !== currentCache)
          .map((key) => caches.delete(key))
      )
    })
  )
  self.clients.claim()
})

// Fetch : cache-first pour les assets, network-first pour la navigation
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  // Ne pas cacher version.json et maintenance.json (toujours frais)
  if (url.pathname.includes('version.json') || url.pathname.includes('maintenance.json')) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    )
    return
  }

  // Fichiers JS/CSS avec hash (assets Vite) : cache-first
  if (url.pathname.match(/\/assets\/.*\.[a-f0-9]+\./)) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached
        return fetch(event.request).then((response) => {
          const clone = response.clone()
          caches.keys().then(keys => {
            const current = keys.find(k => k.startsWith(APP_PREFIX))
            if (current) caches.open(current).then(c => c.put(event.request, clone))
          })
          return response
        })
      })
    )
    return
  }

  // Tout le reste : network-first, fallback cache
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone()
        caches.keys().then(keys => {
          const current = keys.find(k => k.startsWith(APP_PREFIX))
          if (current) caches.open(current).then(c => c.put(event.request, clone))
        })
        return response
      })
      .catch(() => {
        return caches.match(event.request).then((cached) => {
          if (!cached && event.request.mode === 'navigate') {
            return caches.match('/kit-anomalie/index.html')
          }
          return cached
        })
      })
  )
})
