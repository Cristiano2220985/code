<template>
  <div class="card flex items-center gap-1 rounded-full bg-surface p-1">
    <button
      type="button"
      data-testid="servings-decrease"
      aria-label="Decrease servings"
      class="pressable flex h-10 w-10 items-center justify-center rounded-full bg-tile text-lg text-ink disabled:opacity-35"
      :disabled="servings <= min"
      @click="servings = servings - 1"
    >
      &minus;
    </button>
    <span data-testid="servings-value" class="w-8 text-center text-base font-semibold">{{
      servings
    }}</span>
    <button
      type="button"
      data-testid="servings-increase"
      aria-label="Increase servings"
      class="pressable flex h-10 w-10 items-center justify-center rounded-full bg-ink text-lg text-white disabled:opacity-35"
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
