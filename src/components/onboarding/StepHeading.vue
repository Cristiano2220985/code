<template>
  <header class="mb-6">
    <h1 class="text-lg font-bold text-neutral-900">{{ title }}</h1>
    <p class="mt-1 text-xs text-neutral-500">{{ subtitle }}</p>
  </header>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
})
</script>
