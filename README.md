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

## Install and use offline

The production build includes an installable PWA. Run `npm run build` followed
by `npm run preview` and open the localhost URL. To test on a phone, serve
`dist/` from an HTTPS host. Configure the host to serve `index.html` for app
routes such as `/pantry` and `/onboarding`, and serve `sw.js` as JavaScript.
On Vercel, `vercel.json` serves the app for direct requests to `/pantry` and
`/onboarding`. After deploying, open `/pantry` directly to verify that the app
can launch from its Home Screen icon before the service worker takes control.

- Visit SmartPantry once with a connection so the service worker can download
  the application. **Install app** opens the browser's installation prompt or
  shows the relevant browser menu instructions on mobile and in Safari. On
  iPhone, leave **Open as Web App** enabled if offered.
  Open the app from its Home Screen icon while still connected, then test
  offline from the icon. Safari and the installed app use separate website data.
- After the download completes, you can reopen the app and manage profiles,
  pantry items, and the shopping list offline. Changes are saved on the device.
  Try reloading `/pantry` with the network disabled, then add an item and
  reload again to verify it was saved.
- Barcode lookup works offline for the built-in catalogue and previously found
  products. A barcode outside those catalogues needs an internet connection.
- After deploying a new version, close all SmartPantry tabs and app windows to
  let the newly downloaded version take over. The service worker is enabled
  for production builds, including `npm run preview`.

## US-08: Product insertion and lookup

In **+ Add item → Scan barcode** a barcode can be read in three ways:

1. **Camera**: point the camera at the barcode (EAN-13, EAN-8, UPC-A, UPC-E).
2. **Type the number**: "Or type the barcode number" field + **Look up**.
3. **Upload image**: choose a photo of the barcode (JPG or PNG).

The product is searched in the built-in and saved catalogues first (both work
offline) and then in [Open Food Facts](https://world.openfoodfacts.org), a free
public product database. When it is found, the item name, quantity and unit are
filled in and can still be changed before saving. When the camera is unavailable
or the lookup fails, the user can upload an image or enter the item manually.

Test barcodes: `3017620422003` (Nutella, 400 g) and `0000000000000` (not found).

## US-09: Grocery shopping list

The shopping list opens from the cart button in the header. Items are added by name
and stored locally under `smartpantry:shopping-list`.

When an item is bought it can be:

- **scanned**: the camera button of the item opens the scanner (live camera or typed
  barcode number). The item is checked and keeps the quantity and unit of the product;
- **checked** by hand.

**Move to pantry** asks the category, quantity, unit and expiration date of every
checked item (scanned items already come with the quantity and unit). After
**Confirm** the items are added to the pantry and removed from the list; unchecked
items stay on the list.

## US-19: Recipe discovery

**Recipes** in the menu opens the discovery page. **Search Recipes** looks up catalogue
recipes in [TheMealDB](https://www.themealdb.com/api.php) (free public API, test key `1`,
no account needed) using the names of the pantry items.

- Each recipe shows the **pantry match**: ingredients in the pantry ÷ ingredients of the
  recipe. Names are compared without case and singular/plural ("Carrots" = "Carrot").
- Recipes that use an item expiring within 48 hours come first, then the best match.
- Recipes that break the active profile's lifestyles, allergies or excluded ingredients
  are hidden. The rules are keyword lists in `src/utils/recipes.js`.
- The recipe title opens the details: available and missing ingredients and the overlap.
- **Add missing** sends the missing ingredients to the shopping list (US-09).

The free API filters by one ingredient at a time, so a search makes one request per
pantry item and then loads the details of the best candidates (12 results at most).
An internet connection is needed to search.

## US-28: GenAI Sous-Chef

**Recipes → ✦ GenAI Sous-Chef** turns leftovers into an original recipe. Select pantry
items (items expiring within 48 hours are listed first under **Use soon**) and/or type
extra scraps that are not in the pantry, adjust the servings (the active profile's default)
and tap **Generate Recipe**. The recipe has preparation and cooking times, servings,
ingredient measurements (leftovers are tagged) and step-by-step instructions.
**Regenerate** asks for another recipe with the same selection; if the request fails the
selection is kept and **Try again** repeats it.

The recipe comes from [Google Gemini](https://ai.google.dev/gemini-api/docs). Create a free
key at https://aistudio.google.com/apikey and put it in `.env.local` (ignored by Git), then
restart `npm run dev`:

```sh
VITE_GENAI_API_KEY=your-key
# optional, default gemini-2.5-flash
VITE_GENAI_MODEL=gemini-2.5-flash
```

Without a key, a built-in generator (`src/utils/localChef.js`) creates the recipe from the
same request, without internet. Its result is always the same for the same selection, which
also keeps the Katalon tests repeatable. The key is used by the browser, so only use a
personal development key.

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
