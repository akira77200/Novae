// public/sw.js — Novae Service Worker
const CACHE_NAME = 'novae-v1'
const URLS_TO_CACHE = [
  '/',
  '/dashboard',
  '/arrivee',
  '/offline.html',
]

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(URLS_TO_CACHE))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', event => {
  // Ne pas intercepter les requêtes API ou Supabase
  const url = new URL(event.request.url)
  if (url.pathname.startsWith('/api/') || url.hostname.includes('supabase')) return

  event.respondWith(
    caches.match(event.request)
      .then(cached => {
        if (cached) return cached
        return fetch(event.request)
          .then(response => {
            // Cache les pages HTML naviguées
            if (event.request.mode === 'navigate' && response.ok) {
              const clone = response.clone()
              caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone))
            }
            return response
          })
          .catch(() => caches.match('/offline.html'))
      })
  )
})
