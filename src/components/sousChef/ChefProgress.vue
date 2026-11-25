<!-- US-28: Leftovers → Preferences → Recipe progress shown at the top of the Sous-Chef. -->
<template>
  <ol class="flex gap-4 border-b border-neutral-200 pb-3 text-xs" aria-label="Sous-Chef progress">
    <li
      v-for="(label, index) in STEPS"
      :key="label"
      class="flex items-center gap-1.5"
      :class="index <= current ? 'font-semibold text-neutral-900' : 'text-neutral-400'"
      :aria-current="index === current ? 'step' : undefined"
    >
      <span
        class="flex h-5 w-5 items-center justify-center rounded-full border text-[10px]"
        :class="index <= current ? 'border-neutral-800 bg-neutral-800 text-white' : ''"
        >{{ index < current ? '✓' : index + 1 }}</span
      >
      {{ label }}
    </li>
  </ol>
</template>

<script setup>
defineProps({
  current: { type: Number, required: true },
})

const STEPS = ['Leftovers', 'Preferences', 'Recipe']
</script>
