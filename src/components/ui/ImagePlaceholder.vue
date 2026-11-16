<!-- Grey "X" box used by the low-fidelity mockup for logos and images. -->
<template>
  <div
    class="relative shrink-0 overflow-hidden rounded-lg border border-neutral-300 bg-neutral-100"
    :class="sizeClass"
    role="img"
    :aria-label="label"
  >
    <svg
      class="absolute inset-0 h-full w-full text-neutral-300"
      viewBox="0 0 10 10"
      preserveAspectRatio="none"
    >
      <line x1="0" y1="0" x2="10" y2="10" stroke="currentColor" stroke-width="0.2" />
      <line x1="10" y1="0" x2="0" y2="10" stroke="currentColor" stroke-width="0.2" />
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: { type: String, default: 'Image' },
  size: { type: String, default: 'md' },
})

const SIZES = {
  sm: 'h-6 w-6',
  md: 'h-10 w-10',
  lg: 'h-14 w-14',
}

const sizeClass = computed(() => SIZES[props.size] ?? SIZES.md)
</script>
