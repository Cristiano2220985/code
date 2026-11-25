<!-- Line icons (Lucide style). Decorative: the text next to the icon names the action. -->
<template>
  <svg
    class="shrink-0"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    :stroke-width="strokeWidth"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <template v-for="(shape, index) in ICONS[name] ?? []" :key="index">
      <circle
        v-if="shape.circle"
        :cx="shape.circle[0]"
        :cy="shape.circle[1]"
        :r="shape.circle[2]"
      />
      <path v-else :d="shape" />
    </template>
  </svg>
</template>

<script setup>
defineProps({
  name: { type: String, required: true },
  strokeWidth: { type: [Number, String], default: 1.8 },
})

const ICONS = {
  pantry: [
    'M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z',
    'M12 22V12',
    'm3.3 7 7.7 4.73a2 2 0 0 0 2 0L20.7 7',
  ],
  recipes: [
    'M17 21a1 1 0 0 0 1-1v-5.35c0-.46.32-.84.73-1.04a4 4 0 0 0-2.14-7.59 5 5 0 0 0-9.18 0 4 4 0 0 0-2.14 7.59c.41.2.73.58.73 1.04V20a1 1 0 0 0 1 1Z',
    'M6 17h12',
  ],
  book: [
    'M12 7v14',
    'M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z',
  ],
  settings: ['M20 7h-9', 'M14 17H5', { circle: [17, 17, 3] }, { circle: [7, 7, 3] }],
  cart: [
    { circle: [8, 21, 1] },
    { circle: [19, 21, 1] },
    'M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12',
  ],
  clock: [{ circle: [12, 12, 10] }, 'M12 6v6l4 2'],
  alert: [{ circle: [12, 12, 10] }, 'M12 8v4', 'M12 16h.01'],
  search: [{ circle: [11, 11, 8] }, 'm21 21-4.3-4.3'],
  down: ['m6 9 6 6 6-6'],
  right: ['m9 18 6-6-6-6'],
  arrow: ['M5 12h14', 'm12 5 7 7-7 7'],
  close: ['M18 6 6 18', 'm6 6 12 12'],
  check: ['M20 6 9 17l-5-5'],
  barcode: [
    'M3 7V5a2 2 0 0 1 2-2h2',
    'M17 3h2a2 2 0 0 1 2 2v2',
    'M21 17v2a2 2 0 0 1-2 2h-2',
    'M7 21H5a2 2 0 0 1-2-2v-2',
    'M8 7v10',
    'M12 7v10',
    'M17 7v10',
  ],
  leaf: [
    'M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z',
    'M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12',
  ],
}
</script>
