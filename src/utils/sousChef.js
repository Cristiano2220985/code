// US-28 (GenAI Sous-Chef): pure helpers to build the request and read the generated recipe
// (no Vue, no network).

import { daysUntilExpiration, UNIT_LABELS } from '@/utils/pantry'
import { generateId } from '@/utils/profile'
import { normalizeIngredient } from '@/utils/recipes'

// Same rule as the pantry alert tray: expires today or tomorrow (within 48 hours).
export function isUseSoon(item, today = new Date()) {
  const days = daysUntilExpiration(item.expirationDate, today)
  return days >= 0 && days <= 1
}

// Pantry items split into "Use soon" (soonest first) and the rest of the pantry.
export function groupPantryItems(items, today = new Date()) {
  const useSoon = items
    .filter((item) => isUseSoon(item, today))
    .sort((a, b) => a.expirationDate.localeCompare(b.expirationDate))
  return { useSoon, others: items.filter((item) => !useSoon.includes(item)) }
}

export const quantityLabel = (item) => `${item.quantity} ${UNIT_LABELS[item.unit] ?? item.unit}`

/**
 * Data sent to the GenAI API: the selected pantry items (with what is available), the extra
 * scraps typed by the user, the serving size and an optional note.
 */
export function buildRequest({ pantryItems, selectedIds, scraps = [], servings, note = '' }) {
  const fromPantry = pantryItems
    .filter((item) => selectedIds.includes(item.id))
    .map((item) => ({ name: item.name, quantity: item.quantity, unit: item.unit }))
  return {
    ingredients: [...fromPantry, ...scraps.map((name) => ({ name }))],
    servings,
    note: note.trim(),
  }
}

export const ingredientNames = (request) => request.ingredients.map(({ name }) => name)

function describeIngredient({ name, quantity, unit }) {
  return quantity ? `- ${name} (${quantity} ${unit} in the pantry)` : `- ${name} (leftover scrap)`
}

export function buildPrompt(request) {
  return [
    "You are the SmartPantry sous-chef. Create ONE original recipe that uses up the user's leftovers.",
    'Leftovers to use (use all of them, without exceeding the available quantities):',
    ...request.ingredients.map(describeIngredient),
    `Servings: ${request.servings}. Scale every quantity to this number of servings.`,
    request.note ? `Note from the cook: ${request.note}` : '',
    'You may add common staples (oil, salt, pepper, spices, water, stock) when needed.',
    'Answer only with JSON in this shape, quantities with metric units:',
    '{"title": string, "description": string, "prepMinutes": number, "cookMinutes": number,',
    ' "ingredients": [{"name": string, "quantity": string}],',
    ' "steps": [{"text": string, "minutes": number}]}',
  ]
    .filter(Boolean)
    .join('\n')
}

// True when the recipe ingredient is one of the leftovers ("Onion" matches "½ onion").
export function isLeftover(name, leftoverNames) {
  const ingredient = ` ${normalizeIngredient(name)} `
  return leftoverNames.some((leftover) => {
    const scrap = ` ${normalizeIngredient(leftover)} `
    return scrap.includes(ingredient) || ingredient.includes(scrap)
  })
}

const text = (value) => (typeof value === 'string' ? value.trim() : '')
const minutes = (value) => {
  const number = Math.round(Number(value))
  return Number.isFinite(number) && number > 0 ? number : 0
}

/** Checks the answer of the GenAI API and returns the recipe shown by the app. */
export function normalizeRecipe(raw, request, source) {
  const leftovers = ingredientNames(request)
  const ingredients = (Array.isArray(raw?.ingredients) ? raw.ingredients : [])
    .map((ingredient) => ({ name: text(ingredient?.name), measure: text(ingredient?.quantity) }))
    .filter((ingredient) => ingredient.name)
    .map((ingredient) => ({ ...ingredient, leftover: isLeftover(ingredient.name, leftovers) }))
  const steps = (Array.isArray(raw?.steps) ? raw.steps : [])
    .map((step) =>
      typeof step === 'string'
        ? { text: step.trim(), minutes: 0 }
        : { text: text(step?.text), minutes: minutes(step?.minutes) },
    )
    .filter((step) => step.text)
  const name = text(raw?.title)
  if (!name || !ingredients.length || !steps.length) {
    throw new Error('The generated recipe is incomplete.')
  }

  const prepMinutes = minutes(raw.prepMinutes)
  const cookMinutes = minutes(raw.cookMinutes)
  return {
    id: `ai-${generateId()}`,
    name,
    description: text(raw.description),
    category: 'AI creation',
    area: '',
    image: '',
    source,
    servings: request.servings,
    prepMinutes,
    cookMinutes,
    totalMinutes: prepMinutes + cookMinutes || steps.reduce((sum, step) => sum + step.minutes, 0),
    ingredients,
    steps,
  }
}
