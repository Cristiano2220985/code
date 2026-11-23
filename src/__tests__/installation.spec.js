import { shallowMount } from '@vue/test-utils'
import { afterEach, expect, it, vi } from 'vitest'
import App from '@/App.vue'

const installButton = '[data-testid="install-app-button"]'
const instructions = '#pwa-install-help'
const safariMac = 'Mozilla/5.0 (Macintosh; Intel Mac OS X) Version/26.0 Safari/605.1.15'
const chromeAndroid = 'Mozilla/5.0 (Linux; Android 16) Chrome/157.0.0.0 Mobile Safari/537.36'
let wrapper

function openApp(browser, standalone = false) {
  vi.stubGlobal('isSecureContext', true)
  vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: standalone }))
  vi.stubGlobal('navigator', { onLine: true, ...browser })
  wrapper = shallowMount(App, { attachTo: document.body })
  return wrapper
}

afterEach(() => {
  wrapper?.unmount()
  vi.unstubAllGlobals()
})

it.each([
  [{ userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 26_0)' }, 'Add to Home Screen'],
  [{ userAgent: safariMac, platform: 'MacIntel', maxTouchPoints: 5 }, 'Add to Home Screen'],
  [{ userAgent: safariMac, vendor: 'Apple Computer, Inc.' }, 'Add to Dock'],
  [{ userAgent: chromeAndroid }, 'Install and create shortcut'],
])(
  'offers the correct menu instructions for %j before a native prompt is available',
  async (browser, help) => {
    const app = openApp(browser)
    const button = app.get(installButton)

    expect(button.attributes('aria-expanded')).toBe('false')
    expect(app.get(instructions).isVisible()).toBe(false)
    await button.trigger('click')
    expect(button.attributes('aria-expanded')).toBe('true')
    expect(app.get(instructions).isVisible()).toBe(true)
    expect(app.get(instructions).text()).toContain(help)
  },
)

it('uses the Android native prompt when offered and hides the bar after installation', async () => {
  const app = openApp({ userAgent: chromeAndroid })
  const prompt = vi.fn().mockResolvedValue({ outcome: 'accepted' })
  const event = Object.assign(new Event('beforeinstallprompt', { cancelable: true }), { prompt })
  window.dispatchEvent(event)

  await app.get(installButton).trigger('click')
  expect(event.defaultPrevented).toBe(true)
  expect(prompt).toHaveBeenCalledOnce()
  expect(app.find(installButton).exists()).toBe(false)
})

it('keeps the desktop Chrome button tied to the native prompt', async () => {
  const app = openApp({
    userAgent: 'Mozilla/5.0 (Macintosh) Chrome/157.0.0.0 Safari/537.36',
    vendor: 'Google Inc.',
  })
  expect(app.find(installButton).exists()).toBe(false)

  const prompt = vi.fn().mockResolvedValue({ outcome: 'dismissed' })
  const event = Object.assign(new Event('beforeinstallprompt', { cancelable: true }), { prompt })
  window.dispatchEvent(event)
  await app.vm.$nextTick()
  await app.get(installButton).trigger('click')
  expect(prompt).toHaveBeenCalledOnce()
})

it('hides installation guidance when opened as an installed app', () => {
  const app = openApp({ userAgent: chromeAndroid }, true)
  expect(app.find(installButton).exists()).toBe(false)
})
