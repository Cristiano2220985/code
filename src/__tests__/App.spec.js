import { beforeEach, describe, expect, it } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import App from '../App.vue'
import PantryPage from '@/pages/PantryPage.vue'
import { useProfilesStore } from '@/stores/profiles'
import { usePantryStore } from '@/stores/pantry'
import { dateKey, daysUntilExpiration, expirationLabel, isValidDate } from '@/utils/pantry'

beforeEach(() => {
  localStorage.clear()
  setActivePinia(createPinia())
})
const item = (overrides = {}) => ({
  name: 'Pesto sauce',
  category: 'Dairy',
  quantity: 2,
  unit: 'units',
  expirationDate: '2027-11-30',
  ...overrides,
})

describe('pantry data', () => {
  it('adds without replacing existing items, updates by identity and persists categories and items', () => {
    const store = usePantryStore()
    const milk = store.saveItem(item({ name: 'Milk' }))
    const category = store.addCategory(' Sauces ')
    const pesto = store.saveItem(item({ category }))
    store.saveItem(item({ category, quantity: 1 }), pesto.id)
    expect(store.items).toHaveLength(2)
    expect(store.items.find((entry) => entry.id === milk.id).name).toBe('Milk')
    setActivePinia(createPinia())
    const restored = usePantryStore()
    expect(restored.categories).toContain('Sauces')
    expect(restored.items.find((entry) => entry.id === pesto.id).quantity).toBe(1)
  })
  it('rejects invalid entries and duplicate categories without changing inventory', () => {
    const store = usePantryStore()
    for (const draft of [
      item({ name: ' ' }),
      item({ quantity: 0 }),
      item({ quantity: -1 }),
      item({ unit: 'unknown' }),
      item({ category: 'missing' }),
      item({ expirationDate: '2026-02-30' }),
    ])
      expect(() => store.saveItem(draft)).toThrow()
    expect(store.items).toHaveLength(0)
    expect(() => store.addCategory(' dairy ')).toThrow()
    expect(() => store.addCategory('All')).toThrow()
    expect(() => store.addCategory(' ')).toThrow()
  })
  it('recovers from invalid saved data', () => {
    localStorage.setItem(
      'smartpantry:pantry',
      JSON.stringify({ categories: [null, 'Dairy', 'Sauces'], items: [null, {}] }),
    )
    const store = usePantryStore()
    expect(store.items).toEqual([])
    expect(store.categories.filter((name) => name === 'Dairy')).toHaveLength(1)
  })
})

describe('expiration dates', () => {
  it('uses calendar boundaries across daylight saving and validates real dates', () => {
    const today = new Date(2026, 2, 28, 23, 30)
    expect(daysUntilExpiration('2026-03-29', today)).toBe(1)
    expect(expirationLabel('2026-03-28', today)).toBe('Today')
    expect(expirationLabel('2026-03-29', today)).toBe('Tomorrow')
    expect(expirationLabel('2026-03-27', today)).toBe('Expired 1 day ago')
    expect(isValidDate('2026-02-29')).toBe(false)
    expect(isValidDate('2028-02-29')).toBe(true)
  })
})

async function mountPantry() {
  const pinia = createPinia()
  setActivePinia(pinia)
  const profiles = useProfilesStore()
  profiles.addProfile({
    name: 'Family',
    servings: 2,
    lifestyles: [],
    allergies: [],
    excludedIngredients: [],
  })
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'pantry', component: PantryPage },
      { path: '/onboarding', name: 'onboarding', component: { template: '<div />' } },
    ],
  })
  await router.push('/')
  await router.isReady()
  const wrapper = mount(App, { attachTo: document.body, global: { plugins: [pinia, router] } })
  await flushPromises()
  return wrapper
}
async function clickText(wrapper, text) {
  const button = wrapper.findAll('button').find((button) => button.text() === text)
  expect(button, `Missing button: ${text}`).toBeTruthy()
  await button.trigger('click')
  await flushPromises()
}
async function fillForm(values) {
  for (const [key, value] of Object.entries(values)) {
    const input = document.querySelector(`#item-${key}`)
    input.value = value
    input.dispatchEvent(
      new Event(input.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true }),
    )
  }
  await flushPromises()
}
async function submitDialog() {
  document
    .querySelector('[role="dialog"] form')
    .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
  await flushPromises()
}

describe('US2 user flow', () => {
  it('keeps keyboard focus in the modal and restores it when cancelling with Escape', async () => {
    const wrapper = await mountPantry()
    try {
      const opener = wrapper.findAll('button').find((button) => button.text() === '+ Add item')
      opener.element.focus()
      await opener.trigger('click')
      await flushPromises()
      expect(document.activeElement.id).toBe('item-name')
      const dialog = document.querySelector('[role="dialog"]')
      const buttons = dialog.querySelectorAll('button')
      const first = buttons[0],
        last = buttons[buttons.length - 1]
      last.focus()
      last.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }),
      )
      expect(document.activeElement).toBe(first)
      first.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Tab',
          shiftKey: true,
          bubbles: true,
          cancelable: true,
        }),
      )
      expect(document.activeElement).toBe(last)
      await fillForm({ name: 'Unsaved item' })
      dialog.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
      await flushPromises()
      expect(document.querySelector('[role="dialog"]')).toBeNull()
      expect(document.activeElement).toBe(opener.element)
      expect(usePantryStore().items).toHaveLength(0)
      expect(document.body.style.overflow).not.toBe('hidden')
    } finally {
      wrapper.unmount()
    }
  })
  it('creates a category and product, filters, edits, cancels and shows validation errors', async () => {
    const wrapper = await mountPantry()
    try {
      expect(wrapper.find('[data-testid="pantry-empty"]').exists()).toBe(true)
      await clickText(wrapper, '+ Add item')
      await submitDialog()
      expect(document.querySelector('[role="dialog"]').textContent).toContain(
        'Item name is required.',
      )
      await fillForm({ name: 'Pesto sauce', category: '__smartpantry_create_category__' })
      const categoryInput = document.querySelector('#new-category')
      categoryInput.value = 'Sauces'
      categoryInput.dispatchEvent(new Event('input', { bubbles: true }))
      await flushPromises()
      ;[...document.querySelectorAll('[role="dialog"] button')]
        .find((button) => button.textContent === 'Add')
        .click()
      await flushPromises()
      await fillForm({ quantity: '2.5', unit: 'units', expirationDate: dateKey() })
      await submitDialog()
      expect(document.querySelector('[role="dialog"]')).toBeNull()
      expect(wrapper.text()).toContain('Expiring within 48 hours')
      expect(usePantryStore().items[0].category).toBe('Sauces')
      await clickText(wrapper, 'Dairy')
      expect(wrapper.text()).toContain('No items in Dairy yet.')
      await clickText(wrapper, 'Sauces')
      await wrapper.find('ul[aria-label="Pantry items"] button').trigger('click')
      await fillForm({ quantity: '1' })
      await submitDialog()
      expect(usePantryStore().items).toHaveLength(1)
      expect(usePantryStore().items[0].quantity).toBe(1)
      await wrapper.find('ul[aria-label="Pantry items"] button').trigger('click')
      await fillForm({ name: 'Unsaved edit' })
      ;[...document.querySelectorAll('[role="dialog"] button')]
        .find((button) => button.textContent === 'Cancel')
        .click()
      await flushPromises()
      expect(usePantryStore().items[0].name).toBe('Pesto sauce')
    } finally {
      wrapper.unmount()
    }
  })
  it('distinguishes expired items from today and tomorrow and refreshes when editing', async () => {
    const wrapper = await mountPantry()
    try {
      const store = usePantryStore()
      const today = new Date()
      const date = (offset) => {
        const value = new Date(today)
        value.setDate(value.getDate() + offset)
        return dateKey(value)
      }
      const old = store.saveItem(item({ name: 'Old milk', expirationDate: date(-1) }))
      store.saveItem(item({ name: 'Spinach', expirationDate: date(0) }))
      store.saveItem(item({ name: 'Yogurt', expirationDate: date(1) }))
      store.saveItem(item({ name: 'Carrots', expirationDate: date(2) }))
      await flushPromises()
      expect(wrapper.find('section[aria-label="Expired items"]').text()).toContain('Old milk')
      const alerts = wrapper.find('section[aria-label="Expiring within 48 hours"]').text()
      expect(alerts).toContain('Spinach')
      expect(alerts).toContain('Yogurt')
      expect(alerts).not.toContain('Carrots')
      store.saveItem(item({ name: 'Old milk', expirationDate: date(5) }), old.id)
      await flushPromises()
      expect(wrapper.find('section[aria-label="Expired items"]').exists()).toBe(false)
    } finally {
      wrapper.unmount()
    }
  })
})
