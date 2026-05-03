/**
 * DuitKu Service Worker
 * Handles caching and offline support
 */

const CACHE_NAME = 'duitku-v2'
const STATIC_CACHE = 'duitku-static-v2'
const DYNAMIC_CACHE = 'duitku-dynamic-v2'

// Core app shell files to precache
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
  '/icon-192.svg',
  '/icon-maskable.svg'
]

// External resources to cache
const EXTERNAL_RESOURCES = [
  'https://sql.js.org/dist/sql-wasm.js',
  'https://sql.js.org/dist/sql-wasm.wasm',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
]

// Install event — precache app shell
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...')
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Precaching app shell')
        return cache.addAll(APP_SHELL)
      })
      .then(() => {
        // Cache external resources separately (don't fail install if CDN is down)
        return caches.open(DYNAMIC_CACHE).then((cache) => {
          return Promise.allSettled(
            EXTERNAL_RESOURCES.map((url) =>
              cache.add(url).catch((err) => {
                console.warn(`[SW] Failed to cache: ${url}`, err)
              })
            )
          )
        })
      })
      .then(() => self.skipWaiting())
  )
})

// Activate event — clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...')
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => {
            return name !== STATIC_CACHE && name !== DYNAMIC_CACHE
          })
          .map((name) => {
            console.log(`[SW] Deleting old cache: ${name}`)
            return caches.delete(name)
          })
      )
    }).then(() => self.clients.claim())
  )
})

// Fetch event — serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') return

  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) return

  // Skip Supabase API calls — never cache auth/database requests
  if (url.hostname.includes('supabase.co') || url.hostname.includes('supabase.in')) return

  // Skip Vite dev server HMR/websocket requests
  if (url.pathname.startsWith('/@') || url.pathname.startsWith('/__') || url.pathname.startsWith('/node_modules/')) return

  // Strategy: Cache First for static assets, Network First for navigation
  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request))
  } else if (isExternalResource(url)) {
    event.respondWith(cacheFirst(request))
  } else if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request))
  } else {
    event.respondWith(staleWhileRevalidate(request))
  }
})

/**
 * Check if URL is a static asset (JS, CSS, images, fonts)
 */
function isStaticAsset(url) {
  const staticExtensions = ['.js', '.css', '.svg', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.woff', '.woff2', '.ttf', '.eot']
  return staticExtensions.some((ext) => url.pathname.endsWith(ext))
}

/**
 * Check if URL is an external resource we want to cache
 */
function isExternalResource(url) {
  return EXTERNAL_RESOURCES.some((resource) => url.href.startsWith(resource)) ||
    url.hostname === 'sql.js.org' ||
    url.hostname === 'fonts.googleapis.com' ||
    url.hostname === 'fonts.gstatic.com'
}

/**
 * Cache First strategy — serve from cache, fallback to network
 * Best for static assets that don't change often
 */
async function cacheFirst(request) {
  const cached = await caches.match(request)
  if (cached) return cached

  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, response.clone())
    }
    return response
  } catch (error) {
    console.warn('[SW] Cache first fetch failed:', request.url)
    // Return offline fallback for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/index.html')
    }
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' })
  }
}

/**
 * Network First strategy — try network, fallback to cache
 * Best for HTML pages that should be fresh
 */
async function networkFirst(request) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, response.clone())
    }
    return response
  } catch (error) {
    console.log('[SW] Network first: serving from cache')
    const cached = await caches.match(request)
    if (cached) return cached

    // Fallback to index.html for SPA routing
    return caches.match('/index.html')
  }
}

/**
 * Stale While Revalidate — serve from cache immediately, update in background
 * Best for resources that can be slightly stale
 */
async function staleWhileRevalidate(request) {
  const cached = await caches.match(request)

  const fetchPromise = fetch(request)
    .then(async (response) => {
      if (response.ok) {
        try {
          const cache = await caches.open(DYNAMIC_CACHE)
          // Clone BEFORE the response body is consumed
          await cache.put(request, response.clone())
        } catch (e) {
          // Ignore cache write errors
        }
      }
      return response
    })
    .catch(() => null)

  // If we have a cached version, return it immediately
  // The fetch will update the cache in the background
  if (cached) {
    fetchPromise.catch(() => {}) // prevent unhandled rejection
    return cached
  }

  // No cache — wait for network
  return (await fetchPromise) || new Response('Offline', { status: 503 })
}

// Listen for messages from the app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }

  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME })
  }
})
