# SmartPantry

Kitchen assistant built with Vue 3, Pinia, Vue Router, Tailwind CSS and Vite.

Household profiles support dietary preferences, allergies and excluded ingredients.
The pantry supports adding and editing items, custom categories, category filters
and expiration alerts. Items and categories are shared across profiles and stored
locally under `smartpantry:pantry`; profiles describe who is eating.

All item fields are required, quantities must be positive (decimals are supported),
and category names are unique regardless of case. New categories persist even
when the item form is cancelled. Cancelling an item never saves its edits.
The “Expiring within 48 hours” tray uses local calendar dates (today and tomorrow);
expired items appear in a separate tray. Dates are stored as `YYYY-MM-DD`.

Node.js requirement: `^22.18.0 || >=24.12.0`.

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

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```
