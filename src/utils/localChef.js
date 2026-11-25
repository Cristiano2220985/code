// US-28 (GenAI Sous-Chef): built-in recipe generator used when no GenAI API key is configured.
// It returns the same JSON shape as the GenAI API, so the app reads both answers the same way.
// The result only depends on the request, which keeps the app usable offline and in tests.

import { ingredientInGroup, normalizeIngredient } from '@/utils/recipes'

const GRAINS = ['rice', 'pasta', 'spaghetti', 'noodle', 'quinoa', 'couscous', 'bulgur', 'potato']
const PLANT_PROTEINS = ['egg', 'tofu', 'tempeh', 'bean', 'lentil', 'chickpea']

// Amount per serving for each kind of ingredient, in grams (or millilitres for liquids).
const PER_SERVING = { protein: 120, grain: 75, dairy: 100, vegetable: 80 }

const hasWord = (name, words) => {
  const text = ` ${normalizeIngredient(name)} `
  return words.some((word) => text.includes(` ${word} `))
}

export function ingredientKind(name) {
  if (['meat', 'fish', 'shellfish'].some((group) => ingredientInGroup(name, group))) {
    return 'protein'
  }
  if (hasWord(name, PLANT_PROTEINS)) return 'protein'
  if (hasWord(name, GRAINS)) return 'grain'
  if (ingredientInGroup(name, 'milk')) return 'dairy'
  return 'vegetable'
}

// "½ onion" -> "Onion", "half a lemon" -> "Lemon".
export function displayName(name) {
  const clean = name
    .trim()
    .replace(/^[\p{N}\s/.,-]+/u, '')
    .replace(/^(half|some|a|an)\s+(an?\s+)?/i, '')
  return clean ? clean[0].toUpperCase() + clean.slice(1) : name.trim()
}

const formatAmount = (value, small, big) =>
  value >= 1000 ? `${Math.round(value / 100) / 10} ${big}` : `${Math.round(value)} ${small}`

// Quantity for the requested servings, never more than what is in the pantry.
export function measureFor(ingredient, kind, servings) {
  const { quantity, unit } = ingredient
  if (!quantity) return 'all of it'
  if (unit === 'units') return `${Math.min(quantity, Math.ceil(servings / 2))} units`
  const liquid = unit === 'mL' || unit === 'L'
  const available = unit === 'kg' || unit === 'L' ? quantity * 1000 : quantity
  const amount = Math.min(available, PER_SERVING[kind] * servings)
  return liquid ? formatAmount(amount, 'ml', 'L') : formatAmount(amount, 'g', 'kg')
}

const DISHES = { bowl: 'Bowl', soup: 'Soup', pilaf: 'Pilaf', stirFry: 'Stir-Fry' }

function dishType(kinds) {
  if (kinds.has('grain') && kinds.has('protein')) return DISHES.bowl
  if (kinds.has('dairy') && !kinds.has('grain')) return DISHES.soup
  if (kinds.has('grain')) return DISHES.pilaf
  return DISHES.stirFry
}

const joinNames = (names) =>
  names.length > 1 ? `${names.slice(0, -1).join(', ')} & ${names.at(-1)}` : (names[0] ?? '')

const lower = (names) => joinNames(names.map((name) => name.toLowerCase()))

// Extra staples the recipe may need; `staples` lets callers leave some of them out.
export const STAPLES = [
  { name: 'Olive oil', measure: (servings) => `${Math.max(1, Math.round(servings / 2))} tbsp` },
  { name: 'Salt and pepper', measure: () => 'to taste' },
]

export function createLocalRecipe(request, staples = STAPLES) {
  const { servings } = request
  const leftovers = request.ingredients.map((ingredient) => {
    const name = displayName(ingredient.name)
    const kind = ingredientKind(name)
    return { name, kind, measure: measureFor(ingredient, kind, servings) }
  })
  const names = (kind) => leftovers.filter((item) => item.kind === kind).map((item) => item.name)
  const kinds = new Set(leftovers.map((item) => item.kind))
  const dish = dishType(kinds)
  const titleNames = ['protein', 'grain', 'vegetable', 'dairy'].flatMap(names).slice(0, 3)

  const steps = [
    {
      text: `Wash and prepare the ingredients: chop the ${lower(names('vegetable')) || 'vegetables'}${
        names('protein').length
          ? ` and cut the ${lower(names('protein'))} into bite-sized pieces`
          : ''
      }.`,
      minutes: 10,
    },
  ]
  if (names('grain').length) {
    steps.push({
      text: `Cook the ${lower(names('grain'))} in salted boiling water until tender, then drain.`,
      minutes: 15,
    })
  }
  if (names('protein').length) {
    steps.push({
      text: `Heat the olive oil in a large pan and brown the ${lower(names('protein'))}.`,
      minutes: 8,
    })
  }
  if (names('vegetable').length) {
    steps.push({
      text: `Add the ${lower(names('vegetable'))} and cook, stirring, until just tender.`,
      minutes: 6,
    })
  }
  if (names('dairy').length) {
    steps.push({
      text: `Pour in the ${lower(names('dairy'))} and simmer gently without boiling.`,
      minutes: 5,
    })
  }
  steps.push({
    text: `Combine everything, season with salt and pepper and serve in ${servings} portions.`,
    minutes: 2,
  })

  return {
    title: `${joinNames(titleNames)} ${dish}`,
    description: `An original ${dish.toLowerCase()} that uses up your ${lower(
      leftovers.map((item) => item.name),
    )}.`,
    prepMinutes: steps[0].minutes,
    cookMinutes: steps.slice(1).reduce((sum, step) => sum + step.minutes, 0),
    ingredients: [
      ...leftovers.map(({ name, measure }) => ({ name, quantity: measure })),
      ...staples.map((staple) => ({ name: staple.name, quantity: staple.measure(servings) })),
    ],
    steps,
  }
}
