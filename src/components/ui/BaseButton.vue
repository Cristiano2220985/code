<template>
  <button
    :type="type"
    class="rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50"
    :class="VARIANTS[variant]"
  >
    <slot />
  </button>
</template>

<script setup>
defineProps({
  variant: { type: String, default: 'primary' },
  type: { type: String, default: 'button' },
})

const VARIANTS = {
  primary: 'bg-neutral-800 text-white hover:bg-neutral-700',
  secondary: 'border border-neutral-800 bg-white text-neutral-800 hover:bg-neutral-100',
  ghost: 'text-neutral-900 hover:bg-neutral-100',
}
</script>
