<template>
  <button
    type="button"
    :aria-pressed="selected"
    class="rounded-full border px-3.5 py-1.5 text-xs transition-colors"
    :class="
      selected
        ? 'border-neutral-800 bg-neutral-800 font-semibold text-white'
        : 'border-neutral-400 bg-white text-neutral-700 hover:bg-neutral-100'
    "
  >
    {{ label }}
  </button>
</template>

<script setup>
defineProps({
  label: { type: String, required: true },
  selected: { type: Boolean, default: false },
})
</script>
