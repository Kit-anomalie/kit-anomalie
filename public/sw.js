// SW Kit Anomalie — rev 3 (install/activate tolèrent les erreurs réseau : ne plantent jamais)
const APP_PREFIX = 'kit-anomalie-'
const BASE = '/kit-anomalie/'

// Assets précachés pour fonctionner hors-ligne dès la 1re visite connectée.
// content.json est inclus : sans lui, aucun conseil/guide partagé hors-réseau.
const CORE_ASSETS = [
  BASE,
  BASE + 'index.html',
  BASE + 'manifest.json',
  BASE + 'icons/icon-192.svg',
  BASE + 'icons/icon-512.svg',
  BASE + 'favicon.svg',
  BASE + 'content.json',
]

// Installation : purge les anciens caches + precache frais.
// Tout est dans waitUntil + try/catch : un échec réseau ne doit JAMAIS empêcher l'install,
// sinon le SW ne contrôle pas la page et l'app perd tout cache. skipWaiting attendu dans waitUntil.
self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    try {
      // 1. Purge préventive de tous les anciens caches app
      const oldKeys = await caches.keys()
      await Promise.all(
        oldKeys.filter(k => k.startsWith(APP_PREFIX)).map(k => caches.delete(k))
      )
      // 2. Precache la version courante (best-effort : un asset manquant ne casse pas l'install)
      const res = await fetch(BASE + 'version.json', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        const cache = await caches.open(APP_PREFIX + data.v)
        await Promise.all(
          CORE_ASSETS.map(asset => cache.add(asset).catch(() => { /* asset indisponible : ignoré */ }))
        )
      }
    } catch {
      // Offline ou Pages indisponible : on installe quand même
    }
    await self.skipWaiting()
  })())
})

// Activation : nettoie les anciens caches. Tolère l'absence de réseau (ne purge rien si offline).
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    try {
      const res = await fetch(BASE + 'version.json', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        const currentCache = APP_PREFIX + data.v
        const keys = await caches.keys()
        await Promise.all(
          keys
            .filter((key) => key.startsWith(APP_PREFIX) && key !== currentCache)
            .map((key) => caches.delete(key))
        )
      }
    } catch {
      // Offline : on conserve le cache existant plutôt que de tout purger
    }
    await self.clients.claim()
  })())
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
