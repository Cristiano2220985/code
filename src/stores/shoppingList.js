import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { loadState, saveState } from '@/services/storage'
import { usePantryStore } from '@/stores/pantry'
import { validateItem } from '@/utils/pantry'
import { generateId } from '@/utils/profile'

// US-09: items to buy. Checked (or scanned) items can be moved into the pantry.
export const useShoppingListStore = defineStore('shoppingList', () => {
  const saved = loadState('shopping-list', null)
  const items = ref(
    Array.isArray(saved?.items)
      ? saved.items.filter(
          (item) => item && typeof item.id === 'string' && typeof item.name === 'string',
        )
      : [],
  )
  const checkedItems = computed(() => items.value.filter((item) => item.checked))

  function persist() {
    saveState('shopping-list', { items: items.value })
  }

  function find(id) {
    return items.value.find((item) => item.id === id)
  }

  function addItem(value) {
    const name = value.trim()
    if (!name) throw new Error('Item name is required.')
    if (items.value.some((item) => item.name.toLowerCase() === name.toLowerCase()))
      throw new Error('This item is already on the shopping list.')
    const item = { id: generateId(), name, checked: false, scanned: null }
    items.value.push(item)
    persist()
    return item
  }

  function removeItem(id) {
    items.value = items.value.filter((item) => item.id !== id)
    persist()
  }

  function toggleItem(id) {
    const item = find(id)
    if (!item) return
    item.checked = !item.checked
    persist()
  }

  // A scanned product counts as bought: the item is checked and keeps the product details.
  function markScanned(id, product) {
    const item = find(id)
    if (!item) return
    item.checked = true
    item.scanned = {
      quantity: product.quantity || '',
      unit: product.unit || '',
      barcode: product.barcode,
    }
    persist()
  }

  function undoScan(id) {
    const item = find(id)
    if (!item) return
    item.checked = false
    item.scanned = null
    persist()
  }

  // entries: [{ id, name, category, quantity, unit, expirationDate }]
  // Nothing is saved unless every entry is valid.
  function moveToPantry(entries) {
    const pantry = usePantryStore()
    if (entries.some((entry) => Object.keys(validateItem(entry, pantry.categories)).length))
      throw new Error('Please check the item details.')
    for (const entry of entries) {
      const { id, ...draft } = entry
      pantry.saveItem(draft)
      items.value = items.value.filter((item) => item.id !== id)
    }
    persist()
  }

  return {
    items,
    checkedItems,
    addItem,
    removeItem,
    toggleItem,
    markScanned,
    undoScan,
    moveToPantry,
  }
})
