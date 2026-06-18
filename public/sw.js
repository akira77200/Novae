// public/sw.js — Novae Service Worker
// Bump this version on every Netlify deploy to invalidate the old cache
const CACHE_NAME = 'novae-v2'
const URLS_TO_CACHE = [
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

  // Ne jamais intercepter : chunks Next.js, APIs, auth, services externes, non-GET
  const shouldBypass = (
    url.pathname.startsWith('/_next/') ||
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/auth/') ||
    url.hostname !== self.location.hostname ||
    event.request.method !== 'GET' ||
    event.request.headers.has('Authorization') ||
    event.request.headers.has('authorization')
  )

  if (shouldBypass) return

  // Cache-first uniquement pour offline.html, network-first pour les pages
  if (url.pathname === '/offline.html') {
    event.respondWith(caches.match('/offline.html'))
    return
  }

  event.respondWith(
    fetch(event.request)
      .catch(() => caches.match('/offline.html'))
  )
})
