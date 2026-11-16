<template>
  <div class="flex items-center gap-3">
    <button
      type="button"
      data-testid="servings-decrease"
      aria-label="Decrease servings"
      class="flex h-7 w-7 items-center justify-center rounded-full border border-neutral-500 text-neutral-700 disabled:opacity-40"
      :disabled="servings <= min"
      @click="servings = servings - 1"
    >
      &minus;
    </button>
    <span data-testid="servings-value" class="w-5 text-center text-sm font-semibold">{{
      servings
    }}</span>
    <button
      type="button"
      data-testid="servings-increase"
      aria-label="Increase servings"
      class="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-800 text-white disabled:opacity-40"
      :disabled="servings >= max"
      @click="servings = servings + 1"
    >
      +
    </button>
  </div>
</template>

<script setup>
const servings = defineModel({ type: Number, required: true })

defineProps({
  min: { type: Number, default: 1 },
  max: { type: Number, default: 20 },
})
</script>
