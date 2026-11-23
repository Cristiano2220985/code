// @vitest-environment node

import { runInNewContext } from 'node:vm'
import { expect, it, vi } from 'vitest'
import { build } from 'vite'

it('precaches the production app and serves a direct offline navigation under its base path', async () => {
  const base = '/smartpantry/'
  const scope = new URL(base, 'https://example.test')
  const { output } = await build({ base, logLevel: 'silent', build: { write: false } })
  const worker = output.find(({ fileName }) => fileName === 'sw.js')
  const shell = new URL('index.html', scope).href
  const handlers = new Map()
  const cache = {
    addAll: vi.fn().mockResolvedValue(undefined),
    match: vi.fn().mockResolvedValue(new Response('<html>SmartPantry</html>')),
  }
  const fetch = vi.fn().mockRejectedValue(new Error('Offline'))

  runInNewContext(worker.source, {
    URL,
    Request,
    caches: { open: () => cache },
    fetch,
    self: {
      registration: { scope: scope.href },
      addEventListener: (name, handler) => handlers.set(name, handler),
    },
  })

  const waitUntil = vi.fn()
  handlers.get('install')({ waitUntil })
  await waitUntil.mock.calls[0][0]
  const files = cache.addAll.mock.calls[0][0].map(({ url }) => url)
  for (const { fileName } of output) {
    if (fileName !== 'sw.js') expect(files).toContain(new URL(fileName, scope).href)
  }
  expect(files).toContain(shell)
  expect(files).toContain(new URL('manifest.webmanifest', scope).href)

  const respondWith = vi.fn()
  handlers.get('fetch')({
    request: { method: 'GET', mode: 'navigate', url: new URL('pantry', scope).href },
    respondWith,
  })
  expect(await (await respondWith.mock.calls[0][0]).text()).toContain('SmartPantry')
  expect(cache.match).toHaveBeenCalledWith(shell)
  expect(fetch).not.toHaveBeenCalled()
})
