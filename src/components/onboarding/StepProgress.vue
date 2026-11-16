<template>
  <div class="mb-6" data-testid="step-progress">
    <p class="mb-2 text-center text-xs text-neutral-500">
      Step {{ current }} of {{ total }}
    </p>
    <div class="flex gap-1.5">
      <span
        v-for="step in total"
        :key="step"
        class="h-1 flex-1 rounded-full"
        :class="step <= current ? 'bg-neutral-800' : 'bg-neutral-200'"
      />
    </div>
  </div>
</template>

<script setup>
defineProps({
  current: { type: Number, required: true },
  total: { type: Number, required: true },
});
</script>
