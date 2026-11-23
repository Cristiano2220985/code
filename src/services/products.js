// Product lookup by barcode (EAN/UPC).
// The bundled catalogue and previous successful lookups are available offline.

import { loadState, saveState } from '@/services/storage'
import { PANTRY_UNITS } from '@/utils/pantry'

const LOCAL_CATALOGUE = {
  3017620422003: { name: 'Nutella', quantity: 400, unit: 'g' },
  5449000000996: { name: 'Coca-Cola', quantity: 330, unit: 'mL' },
  8000500310427: { name: 'Kinder Bueno', quantity: 43, unit: 'g' },
}

const OPEN_FOOD_FACTS_URL = 'https://world.openfoodfacts.org/api/v2/product/'
const TIMEOUT_MS = 6000
const CATALOGUE_STORAGE_KEY = 'product-catalogue'
const MAX_SAVED_PRODUCTS = 100

// Open Food Facts units -> SmartPantry units
const UNIT_MAP = { g: 'g', kg: 'kg', ml: 'mL', l: 'L' }

export function isValidBarcode(code) {
  return /^\d{8,14}$/.test(code ?? '')
}

function loadCatalogue() {
  const saved = loadState(CATALOGUE_STORAGE_KEY, [])
  return Array.isArray(saved) ? saved : []
}

// Returns a product or null if it is absent, and rejects if remote lookup is unavailable.
export async function findProductByBarcode(code) {
  const barcode = String(code ?? '').trim()
  if (!isValidBarcode(barcode)) return null

  if (LOCAL_CATALOGUE[barcode]) return { ...LOCAL_CATALOGUE[barcode] }

  const cachedProduct = loadCatalogue().find((entry) => entry?.barcode === barcode)?.product
  if (typeof cachedProduct?.name === 'string') return cachedProduct
  if (navigator.onLine === false) throw new Error('Product lookup requires a connection.')

  const response = await fetch(
    `${OPEN_FOOD_FACTS_URL}${barcode}.json?fields=product_name,product_quantity,product_quantity_unit,quantity`,
    { signal: AbortSignal.timeout(TIMEOUT_MS) },
  )
  if (response.status === 404) return null
  if (!response.ok) throw new Error(`Product lookup failed (${response.status}).`)
  const data = await response.json()
  const name = data.product?.product_name
  if (data.status !== 1 || typeof name !== 'string' || !name.trim()) return null

  const product = toPantryProduct(data.product)
  // Read again after the request so overlapping lookups retain each other's results.
  const recentProducts = loadCatalogue()
    .filter((entry) => entry?.barcode !== barcode)
    .slice(0, MAX_SAVED_PRODUCTS - 1)
  saveState(CATALOGUE_STORAGE_KEY, [{ barcode, product }, ...recentProducts])
  return product
}

function toPantryProduct(product) {
  let quantity = Number(product.product_quantity)
  let unit = UNIT_MAP[String(product.product_quantity_unit ?? '').toLowerCase()]

  // Some products only have the text field, e.g. "400 g" or "1,5 L".
  if (!quantity || !unit) {
    const match = String(product.quantity ?? '').match(/([\d.,]+)\s*(kg|g|ml|l)\b/i)
    if (match) {
      quantity = Number(match[1].replace(',', '.'))
      unit = UNIT_MAP[match[2].toLowerCase()]
    }
  }

  return {
    name: product.product_name.trim(),
    quantity: quantity > 0 ? quantity : '',
    unit: PANTRY_UNITS.includes(unit) ? unit : '',
  }
}
