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
  const url = new URL(event.request.url)

  // Ne jamais intercepter : APIs, auth, services externes, non-GET, requêtes avec Authorization
  const shouldBypass = (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/auth/') ||
    url.hostname.includes('supabase') ||
    url.hostname.includes('anthropic') ||
    url.hostname.includes('stripe') ||
    url.hostname.includes('netlify') ||
    event.request.method !== 'GET' ||
    event.request.headers.has('Authorization') ||
    event.request.headers.has('authorization')
  )

  if (shouldBypass) return

  // Seulement pour les pages statiques
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) return response
        return fetch(event.request)
          .catch(() => caches.match('/offline.html'))
      })
  )
})
