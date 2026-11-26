<!-- US-8: empty Recipe Book or collection, with a shortcut to recipe discovery. -->
<template>
  <div class="mt-4 rounded-[26px] border border-dashed border-hairline px-5 py-10 text-center">
    <span
      class="card mx-auto flex h-14 w-14 items-center justify-center rounded-[20px] bg-surface"
      aria-hidden="true"
    >
      <AppIcon name="book" class="h-6 w-6" />
    </span>
    <p class="mt-4 font-semibold">{{ title }}</p>
    <p class="mx-auto mt-1 max-w-xs text-xs text-muted">{{ text }}</p>
    <RouterLink
      :to="{ name: 'recipes' }"
      class="pressable mt-5 inline-flex items-center justify-center rounded-full bg-ink px-5 py-3 text-sm font-medium text-white shadow-[0_10px_24px_-12px_rgb(0_0_0/0.6)] hover:bg-ink-soft"
    >
      Discover recipes
    </RouterLink>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import AppIcon from '@/components/ui/AppIcon.vue'

defineProps({
  title: { type: String, required: true },
  text: { type: String, required: true },
})
</script>
