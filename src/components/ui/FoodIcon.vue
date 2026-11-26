<!--
  Filled, neutral icon for a pantry item or recipe ingredient.
  Uses the ingredient's own icon when the name is recognised (egg, onion...), otherwise its category's.
-->
<template>
  <span
    class="flex shrink-0 items-center justify-center bg-tile text-ink-soft"
    :class="[SIZES[size], rounded]"
  >
    <!-- Static SVG paths from src/constants/foodIcons.js, never user input. -->
    <!-- eslint-disable-next-line vue/no-v-html -->
    <svg
      class="h-[50%] w-[50%]"
      :viewBox="`0 0 ${icon.box} ${icon.box}`"
      aria-hidden="true"
      v-html="icon.body"
    />
  </span>
</template>

<script setup>
import { computed } from 'vue'
import { foodIconFor } from '@/constants/foodIcons'

const props = defineProps({
  name: { type: String, default: '' },
  category: { type: String, default: '' },
  size: { type: String, default: 'md' },
  rounded: { type: String, default: 'rounded-2xl' },
})

const SIZES = { sm: 'h-9 w-9', md: 'h-14 w-14', lg: 'h-16 w-16' }

const icon = computed(() => foodIconFor(props.name, props.category))
</script>
