// Product lookup by barcode (EAN/UPC).
// 1. A small local catalogue, so the most common products work offline.
// 2. Open Food Facts (free public database) for every other barcode.

import { PANTRY_UNITS } from '@/utils/pantry'

const LOCAL_CATALOGUE = {
  3017620422003: { name: 'Nutella', quantity: 400, unit: 'g' },
  5449000000996: { name: 'Coca-Cola', quantity: 330, unit: 'mL' },
  8000500310427: { name: 'Kinder Bueno', quantity: 43, unit: 'g' },
}

const OPEN_FOOD_FACTS_URL = 'https://world.openfoodfacts.org/api/v2/product/'
const TIMEOUT_MS = 6000

// Open Food Facts units -> SmartPantry units
const UNIT_MAP = { g: 'g', kg: 'kg', ml: 'mL', l: 'L' }

export function isValidBarcode(code) {
  return /^\d{8,14}$/.test(code ?? '')
}

// Returns { name, quantity, unit } or null when the product is not found.
export async function findProductByBarcode(code) {
  const barcode = String(code ?? '').trim()
  if (!isValidBarcode(barcode)) return null

  if (LOCAL_CATALOGUE[barcode]) return { ...LOCAL_CATALOGUE[barcode] }

  try {
    const response = await fetch(
      `${OPEN_FOOD_FACTS_URL}${barcode}.json?fields=product_name,product_quantity,product_quantity_unit,quantity`,
      { signal: AbortSignal.timeout(TIMEOUT_MS) },
    )
    if (!response.ok) return null
    const data = await response.json()
    if (data.status !== 1 || !data.product?.product_name) return null
    return toPantryProduct(data.product)
  } catch {
    // No internet or the request took too long: treated as "not found".
    return null
  }
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
