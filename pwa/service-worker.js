// The build prepends the version and the URLs emitted by Vite.
const scope = new URL(self.registration.scope)
const cachePrefix = `smartpantry:${scope.pathname}:`
const cacheName = `${cachePrefix}${precache.version}`
const files = new Set(precache.files.map((file) => new URL(file, scope).href))
const shell = new URL('index.html', scope).href

self.addEventListener('install', (event) => {
  event.waitUntil(precacheFiles())
})

async function precacheFiles() {
  const cache = await caches.open(cacheName)
  await cache.addAll([...files].map((url) => new Request(url, { cache: 'reload' })))
}

self.addEventListener('activate', (event) => {
  event.waitUntil(activate())
})

async function activate() {
  const names = await caches.keys()
  const obsolete = names.filter((name) => name.startsWith(cachePrefix) && name !== cacheName)
  await Promise.all(obsolete.map((name) => caches.delete(name)))
  await self.clients.claim()
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  if (
    request.method !== 'GET' ||
    url.origin !== scope.origin ||
    !url.pathname.startsWith(scope.pathname)
  )
    return

  if (files.has(url.href)) event.respondWith(fromCache(url.href, request))
  else if (request.mode === 'navigate') event.respondWith(fromCache(shell, request))
})

async function fromCache(key, request) {
  const cache = await caches.open(cacheName)
  return (await cache.match(key)) ?? fetch(request)
}
