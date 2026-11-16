import { ref } from 'vue'
import { defineStore } from 'pinia'
import { loadState, saveState } from '@/services/storage'
import { DEFAULT_CATEGORIES, validateItem } from '@/utils/pantry'
import { generateId } from '@/utils/profile'

// Household inventory is shared; profiles describe who is eating.
export const usePantryStore = defineStore('pantry', () => {
  const saved = loadState('pantry', null)
  const categories = ref([...DEFAULT_CATEGORIES])
  if (Array.isArray(saved?.categories)) {
    for (const name of saved.categories) {
      if (
        typeof name === 'string' &&
        name.trim() &&
        !categories.value.some((category) => category.toLowerCase() === name.trim().toLowerCase())
      )
        categories.value.push(name.trim())
    }
  }
  const items = ref(
    Array.isArray(saved?.items)
      ? saved.items.filter(
          (item) =>
            item &&
            typeof item.id === 'string' &&
            !Object.keys(validateItem(item, categories.value)).length,
        )
      : [],
  )

  function persist() {
    saveState('pantry', { categories: categories.value, items: items.value })
  }

  function addCategory(value) {
    const name = value.trim()
    if (!name) throw new Error('Category name is required.')
    if (name === '__smartpantry_create_category__')
      throw new Error('Please choose another category name.')
    if (
      name.toLowerCase() === 'all' ||
      categories.value.some((category) => category.toLowerCase() === name.toLowerCase())
    )
      throw new Error('A category with this name already exists.')
    categories.value.push(name)
    persist()
    return name
  }

  function saveItem(draft, id = null) {
    if (Object.keys(validateItem(draft, categories.value)).length)
      throw new Error('Please check the item details.')
    const item = {
      id: id ?? generateId(),
      name: draft.name.trim(),
      category: draft.category,
      quantity: Number(draft.quantity),
      unit: draft.unit,
      expirationDate: draft.expirationDate,
    }
    if (id) {
      const index = items.value.findIndex((entry) => entry.id === id)
      if (index === -1) throw new Error('This item no longer exists.')
      items.value[index] = item
    } else items.value.unshift(item)
    persist()
    return item
  }

  return { items, categories, addCategory, saveItem }
})
