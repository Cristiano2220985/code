export const DEFAULT_CATEGORIES = ['Dairy', 'Vegetables', 'Meat', 'Fruit', 'Frozen', 'Sweets']
export const PANTRY_UNITS = ['g', 'kg', 'mL', 'L', 'units']
// Text shown in the unit <select>; the saved value stays the same.
export const UNIT_LABELS = { units: 'Units' }

export function dateKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value ?? '')) return false
  const date = new Date(`${value}T12:00:00`)
  return !Number.isNaN(date.getTime()) && dateKey(date) === value
}

// Expiration dates represent local calendar days, rather than instants.
export function daysUntilExpiration(value, today = new Date()) {
  if (!isValidDate(value)) return Infinity
  const [year, month, day] = value.split('-').map(Number)
  return Math.round(
    (Date.UTC(year, month - 1, day) -
      Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())) /
      86400000,
  )
}

export function expirationLabel(value, today = new Date()) {
  const days = daysUntilExpiration(value, today)
  if (days < 0) return `Expired ${Math.abs(days)} ${days === -1 ? 'day' : 'days'} ago`
  if (days === 0) return 'Today'
  if (days === 1) return 'Tomorrow'
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    ...(value.slice(0, 4) !== String(today.getFullYear()) ? { year: 'numeric' } : {}),
  }).format(new Date(`${value}T12:00:00`))
}

export function validateItem(draft, categories) {
  const errors = {}
  if (typeof draft.name !== 'string' || !draft.name.trim()) errors.name = 'Item name is required.'
  if (!categories.includes(draft.category)) errors.category = 'Choose a category.'
  if (!Number.isFinite(Number(draft.quantity)) || Number(draft.quantity) <= 0)
    errors.quantity = 'Enter a quantity greater than zero.'
  if (!PANTRY_UNITS.includes(draft.unit)) errors.unit = 'Choose a unit.'
  if (!isValidDate(draft.expirationDate)) errors.expirationDate = 'Enter a valid expiration date.'
  return errors
}
