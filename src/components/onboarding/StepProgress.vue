<template>
  <div class="mb-7" data-testid="step-progress">
    <p class="mb-2.5 text-xs font-medium text-muted">Step {{ current }} of {{ total }}</p>
    <div class="flex gap-1.5">
      <span
        v-for="step in total"
        :key="step"
        class="h-1.5 flex-1 rounded-full transition-colors duration-300"
        :class="step <= current ? 'bg-ink' : 'bg-hairline'"
      />
    </div>
  </div>
</template>

<script setup>
defineProps({
  current: { type: Number, required: true },
  total: { type: Number, required: true },
})
</script>
