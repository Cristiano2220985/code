import { ref } from 'vue'
import { defineStore } from 'pinia'
import { loadState, saveState } from '@/services/storage'
import { isValidSavedRecipe, toSavedRecipe } from '@/utils/recipeBook'

const STORAGE_KEY = 'recipe-book'

// US-8: recipes saved by the household, available offline from the Book page.
export const useRecipeBookStore = defineStore('recipeBook', () => {
  const saved = loadState(STORAGE_KEY, null)
  const recipes = ref(Array.isArray(saved?.recipes) ? saved.recipes.filter(isValidSavedRecipe) : [])

  function persist() {
    saveState(STORAGE_KEY, { recipes: recipes.value })
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

  return { recipes, isSaved, saveRecipe }
})
