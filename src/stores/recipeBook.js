import { ref } from 'vue'
import { defineStore } from 'pinia'
import { loadState, saveState } from '@/services/storage'
import {
  isValidCollection,
  isValidSavedRecipe,
  toSavedRecipe,
  validateCollectionName,
} from '@/utils/recipeBook'
import { generateId } from '@/utils/profile'

const STORAGE_KEY = 'recipe-book'

// US-8: recipes saved by the household, available offline from the Book page, and the
// collections used to organize them (a collection only keeps the ids of saved recipes).
export const useRecipeBookStore = defineStore('recipeBook', () => {
  const saved = loadState(STORAGE_KEY, null)
  const recipes = ref(Array.isArray(saved?.recipes) ? saved.recipes.filter(isValidSavedRecipe) : [])
  const collections = ref(
    Array.isArray(saved?.collections) ? saved.collections.filter(isValidCollection) : [],
  )

  function persist() {
    saveState(STORAGE_KEY, { recipes: recipes.value, collections: collections.value })
  }

  function isSaved(recipeId) {
    return recipes.value.some((recipe) => recipe.id === String(recipeId))
  }

  // Saving the same recipe twice keeps a single copy.
  function saveRecipe(recipe) {
    if (isSaved(recipe.id)) return
    recipes.value.unshift(toSavedRecipe(recipe))
    persist()
  }

  function createCollection(value) {
    const error = validateCollectionName(value, collections.value)
    if (error) throw new Error(error)
    const collection = { id: generateId(), name: value.trim(), recipeIds: [] }
    collections.value.push(collection)
    persist()
    return collection
  }

  return { recipes, collections, isSaved, saveRecipe, createCollection }
})
