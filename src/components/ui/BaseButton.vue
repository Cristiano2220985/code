<template>
  <button
    :type="type"
    class="inline-flex items-center justify-center gap-2 pressable rounded-full px-5 py-3 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-45"
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
  primary: 'bg-ink text-white shadow-[0_10px_24px_-12px_rgb(0_0_0/0.6)] hover:bg-ink-soft',
  secondary: 'bg-surface text-ink ring-1 ring-hairline hover:ring-ink/30',
  ghost: 'text-ink hover:bg-ink/5',
}
</script>
