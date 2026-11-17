// Pure helper functions for household profiles (no Vue dependencies).

import {
  DEFAULT_SERVINGS,
  DIETARY_LIFESTYLES,
  FOOD_ALLERGENS,
  NO_RESTRICTIONS_LABEL,
  SERVINGS_MAX,
  SERVINGS_MIN,
} from '@/constants/profileOptions'

export function createEmptyProfileDraft() {
  return {
    name: '',
    servings: DEFAULT_SERVINGS,
    lifestyles: [],
    allergies: [],
    excludedIngredients: [],
  }
}

export function generateId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export function clampServings(value) {
  const number = Math.round(Number(value)) || SERVINGS_MIN
  return Math.min(SERVINGS_MAX, Math.max(SERVINGS_MIN, number))
}

/** Returns an error message, or an empty string when the name is valid. */
export function validateProfileName(name, existingProfiles = [], ignoreId = null) {
  const trimmed = (name ?? '').trim()

  if (!trimmed) {
    return 'Profile name is required.'
  }

  const isDuplicate = existingProfiles.some(
    (profile) => profile.id !== ignoreId && profile.name.toLowerCase() === trimmed.toLowerCase(),
  )

  return isDuplicate ? 'A profile with this name already exists.' : ''
}

/** Adds or removes a value from a list, returning a new list. */
export function toggleValue(list, value) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
}

export function hasIngredient(list, ingredient) {
  const normalized = ingredient.trim().toLowerCase()
  return list.some((item) => item.toLowerCase() === normalized)
}

/** Adds a trimmed ingredient to the list, ignoring empty values and duplicates. */
export function addIngredient(list, ingredient) {
  const trimmed = (ingredient ?? '').trim()

  if (!trimmed || hasIngredient(list, trimmed)) {
    return list
  }

  return [...list, trimmed]
}

export function formatServings(servings) {
  return `${servings} ${servings === 1 ? 'serving' : 'servings'}`
}

function labelsFor(values, options) {
  return values.map((value) => options.find((option) => option.value === value)?.label ?? value)
}

/** Builds the short description shown in the profile switcher, e.g. "1 serving · Vegetarian · Peanuts". */
export function getProfileSummary(profile) {
  const lifestyles = labelsFor(profile.lifestyles, DIETARY_LIFESTYLES)
  const allergies = labelsFor(profile.allergies, FOOD_ALLERGENS)
  const restrictions = lifestyles.length ? lifestyles : [NO_RESTRICTIONS_LABEL]

  return [formatServings(profile.servings), ...restrictions, ...allergies].join(' · ')
}

/** Creates a clean profile object from the onboarding draft. */
export function buildProfile(draft) {
  return {
    id: generateId(),
    name: draft.name.trim(),
    servings: clampServings(draft.servings),
    lifestyles: [...draft.lifestyles],
    allergies: [...draft.allergies],
    excludedIngredients: [...draft.excludedIngredients],
  }
}
