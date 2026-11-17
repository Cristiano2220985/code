// Small wrapper around localStorage so the app works offline and
// the persistence layer can be replaced or mocked in tests.

const KEY_PREFIX = 'smartpantry:'

export function loadState(key, fallback) {
  try {
    const raw = localStorage.getItem(KEY_PREFIX + key)
    return raw === null ? fallback : JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function saveState(key, value) {
  try {
    localStorage.setItem(KEY_PREFIX + key, JSON.stringify(value))
  } catch {
    // Storage may be full or unavailable (e.g. private mode); the app keeps working in memory.
  }
}
