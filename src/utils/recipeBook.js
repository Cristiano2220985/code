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

/** Returns an error message, or an empty string when the collection name is valid. */
export function validateCollectionName(name, collections = []) {
  const trimmed = (name ?? '').trim()
  if (!trimmed) return 'Collection name is required.'
  const exists = collections.some(
    (collection) => collection.name.toLowerCase() === trimmed.toLowerCase(),
  )
  return exists ? 'A collection with this name already exists.' : ''
}

export function isValidCollection(collection) {
  return Boolean(
    collection &&
    typeof collection.id === 'string' &&
    typeof collection.name === 'string' &&
    Array.isArray(collection.recipeIds),
  )
}

// Saved recipes of a collection, in the order they were added.
export function recipesInCollection(collection, recipes) {
  return collection.recipeIds
    .map((id) => recipes.find((recipe) => recipe.id === id))
    .filter(Boolean)
}
