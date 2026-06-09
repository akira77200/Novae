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

  // Ne jamais intercepter les APIs et Supabase
  if (
    url.pathname.startsWith('/api/') ||
    url.hostname.includes('supabase.co') ||
    url.hostname.includes('anthropic.com') ||
    url.hostname.includes('stripe.com') ||
    event.request.method === 'POST' ||
    event.request.headers.get('Authorization')
  ) {
    return // Laisse passer sans intercepter
  }

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
