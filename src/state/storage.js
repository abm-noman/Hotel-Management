// Saves the whole app state in the browser. Bump VERSION when the data shape changes,
// so old saved data is ignored instead of breaking the app.
const KEY = 'hotel-ops:data'
const VERSION = 3 // v3: Nordstay UI rewrite

export function loadState(fallback) {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return fallback
    const saved = JSON.parse(raw)
    if (saved.version !== VERSION) return fallback
    return { ...fallback, ...saved.state, panel: null }
  } catch {
    return fallback
  }
}

// Returns false when the browser refuses (storage full or blocked).
export function saveState(state) {
  try {
    const { panel, ...persistent } = state
    localStorage.setItem(KEY, JSON.stringify({ version: VERSION, state: persistent }))
    return true
  } catch {
    return false
  }
}

export function clearState() {
  try { localStorage.removeItem(KEY) } catch {}
}

export const STORAGE_KEY = KEY
