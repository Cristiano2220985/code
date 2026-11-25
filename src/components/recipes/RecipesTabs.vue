<!-- US-28: switches between catalogue recipes (US-19) and the GenAI Sous-Chef. -->
<template>
  <nav
    class="mb-5 grid grid-cols-2 gap-1 rounded-xl border border-neutral-300 p-1"
    aria-label="Recipes"
  >
    <RouterLink
      :to="{ name: 'recipes' }"
      class="rounded-lg px-3 py-2 text-center text-sm"
      exact-active-class="bg-neutral-800 font-semibold text-white"
    >
      Catalog recipes
    </RouterLink>
    <RouterLink
      :to="{ name: 'sous-chef' }"
      data-testid="genai-sous-chef-nav-button"
      class="rounded-lg px-3 py-2 text-center text-sm"
      exact-active-class="bg-neutral-800 font-semibold text-white"
    >
      ✦ GenAI Sous-Chef
    </RouterLink>
  </nav>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>
