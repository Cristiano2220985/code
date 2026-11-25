<template>
  <header class="mb-7">
    <h1 class="text-[32px] leading-[1.05] font-semibold tracking-[-0.04em] text-ink">
      {{ title }}
    </h1>
    <p class="mt-2 text-sm text-muted">{{ subtitle }}</p>
  </header>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
})
</script>
