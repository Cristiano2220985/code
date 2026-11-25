<!-- US-8: empty Recipe Book or collection, with a shortcut to recipe discovery. -->
<template>
  <div class="mt-4 rounded-xl border border-dashed border-neutral-300 px-5 py-10 text-center">
    <p class="font-semibold">{{ title }}</p>
    <p class="mx-auto mt-1 max-w-xs text-xs text-neutral-500">{{ text }}</p>
    <RouterLink
      :to="{ name: 'recipes' }"
      class="mt-4 inline-block rounded-lg bg-neutral-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-neutral-700"
    >
      Discover recipes
    </RouterLink>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'

defineProps({
  title: { type: String, required: true },
  text: { type: String, required: true },
})
</script>
