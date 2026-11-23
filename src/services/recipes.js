// US-19: catalogue recipes from TheMealDB (free public API, test key "1", CORS enabled).
// The free API filters by one ingredient at a time, so the search runs one request per
// pantry item and then loads the full ingredient list of the best candidates.

import { normalizeIngredient } from '@/utils/recipes'

const BASE_URL = 'https://www.themealdb.com/api/json/v1/1'
const TIMEOUT_MS = 8000
const MAX_INGREDIENTS = 20

const filterCache = new Map()
const recipeCache = new Map()

export class RecipeServiceError extends Error {}

async function request(path) {
  let response
  try {
    response = await fetch(`${BASE_URL}${path}`, { signal: AbortSignal.timeout(TIMEOUT_MS) })
  } catch {
    throw new RecipeServiceError('Could not reach the recipe service.')
  }
  if (!response.ok) throw new RecipeServiceError('The recipe service is not available.')
  const data = await response.json()
  return Array.isArray(data?.meals) ? data.meals : []
}

// TheMealDB writes ingredients with underscores in the URL, e.g. "tomato_sauce".
const ingredientQuery = (name) => encodeURIComponent(name.trim().toLowerCase().replace(/\s+/g, '_'))

// The filter only accepts TheMealDB's exact ingredient name ("Apples", not "Apple"), so the
// pantry name is first mapped to the catalogue names with the same singular form.
let catalogueNames = null
async function catalogueIngredients(name) {
  catalogueNames ??= request('/list.php?i=list')
    .then((items) => {
      const byName = new Map()
      for (const item of items) {
        const key = normalizeIngredient(item.strIngredient)
        if (key) byName.set(key, [...(byName.get(key) ?? []), item.strIngredient])
      }
      return byName
    })
    .catch(() => {
      catalogueNames = null // try again on the next search
      return new Map()
    })
  const names = (await catalogueNames).get(normalizeIngredient(name))
  return names?.length ? names : [name]
}

/** Meal ids that use one ingredient: [{ id, name, image }] */
export async function findRecipeIdsByIngredient(ingredient) {
  const key = ingredient.trim().toLowerCase()
  if (!key) return []
  if (!filterCache.has(key)) {
    const names = await catalogueIngredients(key)
    const lists = await Promise.all(
      names.map((name) => request(`/filter.php?i=${ingredientQuery(name)}`)),
    )
    const meals = new Map()
    for (const meal of lists.flat()) {
      meals.set(meal.idMeal, { id: meal.idMeal, name: meal.strMeal, image: meal.strMealThumb })
    }
    filterCache.set(key, [...meals.values()])
  }
  return filterCache.get(key)
}

/** Full recipe with its ingredient list, or null when the id does not exist. */
export async function getRecipe(id) {
  if (!recipeCache.has(id)) {
    const [meal] = await request(`/lookup.php?i=${encodeURIComponent(id)}`)
    recipeCache.set(id, meal ? toRecipe(meal) : null)
  }
  return recipeCache.get(id)
}

function toRecipe(meal) {
  const ingredients = []
  for (let index = 1; index <= MAX_INGREDIENTS; index++) {
    const name = (meal[`strIngredient${index}`] ?? '').trim()
    if (name) ingredients.push({ name, measure: (meal[`strMeasure${index}`] ?? '').trim() })
  }
  return {
    id: meal.idMeal,
    name: meal.strMeal.trim(),
    category: meal.strCategory ?? '',
    area: meal.strArea && meal.strArea !== 'Unknown' ? meal.strArea : '',
    image: meal.strMealThumb ?? '',
    ingredients,
  }
}

/**
 * Candidate recipes for the pantry, best first: recipes that use an expiring item, then the ones
 * that use more pantry items, then the ones found through rarer ingredients (more specific).
 */
export async function findCandidates(pantryNames, expiringNames = []) {
  const names = [...new Set(pantryNames.map((name) => name.trim()).filter(Boolean))]
  const results = await Promise.all(names.map((name) => findRecipeIdsByIngredient(name)))
  const candidates = new Map()
  results.forEach((meals, index) => {
    const expiring = expiringNames.some((name) => name.toLowerCase() === names[index].toLowerCase())
    for (const meal of meals) {
      const entry = candidates.get(meal.id) ?? { ...meal, hits: 0, expiring: false, specificity: 0 }
      entry.hits++
      entry.expiring ||= expiring
      entry.specificity += 1 / meals.length
      candidates.set(meal.id, entry)
    }
  })
  return [...candidates.values()].sort(
    (a, b) =>
      Number(b.expiring) - Number(a.expiring) ||
      b.hits - a.hits ||
      b.specificity - a.specificity ||
      a.name.localeCompare(b.name),
  )
}

/** Loads recipes in small batches until `accept` has approved `limit` of them (or `maxLookups` is reached). */
export async function loadRecipes(
  candidates,
  { limit = 12, maxLookups = 60, batchSize = 12, accept = () => true } = {},
) {
  const accepted = []
  let rejected = 0
  const queue = candidates.slice(0, maxLookups)
  for (let start = 0; start < queue.length && accepted.length < limit; start += batchSize) {
    const recipes = await Promise.all(
      queue.slice(start, start + batchSize).map((meal) => getRecipe(meal.id)),
    )
    for (const recipe of recipes) {
      if (!recipe) continue
      if (accept(recipe)) accepted.push(recipe)
      else rejected++
    }
  }
  return { recipes: accepted.slice(0, limit), rejected }
}
