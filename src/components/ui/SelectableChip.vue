<template>
  <button
    type="button"
    :aria-pressed="selected"
    class="pressable h-11 rounded-full px-4 text-sm"
    :class="
      selected ? 'bg-ink font-medium text-white' : 'card bg-surface text-ink-soft hover:text-ink'
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
