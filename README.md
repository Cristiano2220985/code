# SmartPantry

Kitchen assistant built with Vue 3, Pinia, Vue Router, Tailwind CSS and Vite.

Household profiles support dietary preferences, allergies and excluded ingredients.
The pantry supports adding and editing items, custom categories, category filters
and expiration alerts. Items and categories are shared across profiles and stored
locally under `smartpantry:pantry`; profiles describe who is eating.

All item fields are required, quantities must be positive (decimals are supported),
and category names are unique regardless of case. New categories persist even
when the item form is cancelled. Cancelling an item never saves its edits.
The "Expiring within 48 hours" tray uses local calendar dates (today and tomorrow);
expired items appear in a separate tray. Dates are stored as `YYYY-MM-DD`.

## Requirements

- Node.js `^22.18.0 || >=24.12.0`
- npm (comes with Node.js)

## Project Setup

After cloning, or after pulling a branch that changed `package.json`, install the dependencies:

```sh
npm install
```

This also installs the libraries added in US-08:

| Package          | Why                                                     |
| ---------------- | ------------------------------------------------------- |
| `@zxing/browser` | Reads barcodes from the camera and from uploaded images |
| `@zxing/library` | Barcode formats used by `@zxing/browser` (EAN, UPC)     |

Nothing else needs to be installed.

### Compile and Hot-Reload for Development

```sh
npm run dev
```

Open http://localhost:5173. This is the address used by the Katalon tests.

### Open on a phone

Connect the phone to the same Wi-Fi network, run `npm run dev -- --host` and open
the `Network` address shown in the terminal.

Browsers only allow the live camera preview on `https` pages or on `localhost`, so
on `http://192.168…` the scanner shows "Camera access is not available". On a phone,
**Upload image** still opens the camera to take a photo of the barcode, and the
barcode number can always be typed.

### Compile and Minify for Production

```sh
npm run build
```

## US-08: Product insertion and lookup

In **+ Add item → Scan barcode** a barcode can be read in three ways:

1. **Camera**: point the camera at the barcode (EAN-13, EAN-8, UPC-A, UPC-E).
2. **Type the number**: "Or type the barcode number" field + **Look up**.
3. **Upload image**: choose a photo of the barcode (JPG or PNG).

The product is searched in a small local catalogue first (works offline) and then
in [Open Food Facts](https://world.openfoodfacts.org), a free public product database
(needs internet). When it is found, the item name, quantity and unit are filled in
and can still be changed before saving. When the camera is not available or the
product is not found, the user can upload an image or enter the item manually.

Test barcodes: `3017620422003` (Nutella, 400 g) and `0000000000000` (not found).

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).
