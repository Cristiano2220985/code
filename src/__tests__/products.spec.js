import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { findProductByBarcode } from '@/services/products'

const barcode = '1234567890123'
const remoteProduct = {
  status: 1,
  product: { product_name: 'Orange juice', product_quantity: 750, product_quantity_unit: 'ml' },
}

const setOffline = () => vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false)

beforeEach(() => localStorage.clear())
afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('offline barcode lookup', () => {
  it('uses the built-in catalogue without fetching', async () => {
    const fetch = vi.fn()
    vi.stubGlobal('fetch', fetch)
    setOffline()

    await expect(findProductByBarcode('3017620422003')).resolves.toEqual({
      name: 'Nutella',
      quantity: 400,
      unit: 'g',
    })
    await expect(findProductByBarcode(barcode)).rejects.toThrow('requires a connection')
    expect(fetch).not.toHaveBeenCalled()
  })

  it('reuses a successful lookup from storage after losing the connection', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify(remoteProduct)))
    vi.stubGlobal('fetch', fetch)
    const product = await findProductByBarcode(barcode)
    expect(product).toEqual({ name: 'Orange juice', quantity: 750, unit: 'mL' })

    setOffline()
    await expect(findProductByBarcode(barcode)).resolves.toEqual(product)
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('distinguishes unavailable lookups from missing products and permits a retry', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 503 }))
      .mockResolvedValueOnce(new Response(null, { status: 404 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(remoteProduct)))
    vi.stubGlobal('fetch', fetch)

    await expect(findProductByBarcode(barcode)).rejects.toThrow('503')
    await expect(findProductByBarcode(barcode)).resolves.toBeNull()
    await expect(findProductByBarcode(barcode)).resolves.toMatchObject({ name: 'Orange juice' })
  })
})
