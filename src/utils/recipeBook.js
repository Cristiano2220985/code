// US-8 (Recipe Book): pure helpers for saved recipes (no Vue, no network).

// Keeps only the recipe fields needed to show it again offline.
export function toSavedRecipe(recipe) {
  return {
    id: String(recipe.id),
    name: recipe.name.trim(),
    category: recipe.category ?? '',
    area: recipe.area ?? '',
    image: recipe.image ?? '',
    ingredients: (recipe.ingredients ?? []).map(({ name, measure }) => ({
      name,
      measure: measure ?? '',
    })),
  }
}

export function isValidSavedRecipe(recipe) {
  return Boolean(
    recipe &&
    typeof recipe.id === 'string' &&
    typeof recipe.name === 'string' &&
    Array.isArray(recipe.ingredients),
  )
}

// Case-insensitive search by recipe name.
export function filterRecipesByName(recipes, query) {
  const text = (query ?? '').trim().toLowerCase()
  if (!text) return recipes
  return recipes.filter((recipe) => recipe.name.toLowerCase().includes(text))
}

export function recipeOrigin(recipe) {
  return [recipe.category, recipe.area].filter(Boolean).join(' · ')
}

export const countLabel = (count, singular, plural = `${singular}s`) =>
  `${count} ${count === 1 ? singular : plural}`
