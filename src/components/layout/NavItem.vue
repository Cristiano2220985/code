<!-- Navigation entry: a router link when the feature exists, otherwise a disabled item. -->
<template>
  <RouterLink
    v-if="item.routeName"
    :to="{ name: item.routeName }"
    :data-testid="item.testId"
    class="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-100"
    active-class="!bg-neutral-800 font-semibold !text-white"
  >
    <span class="h-3.5 w-3.5 shrink-0 rounded border border-current opacity-60" />
    {{ item.label }}
  </RouterLink>
  <span
    v-else
    :data-testid="item.testId"
    aria-disabled="true"
    title="Coming soon"
    class="flex cursor-not-allowed items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-neutral-400"
  >
    <span class="h-3.5 w-3.5 shrink-0 rounded border border-current opacity-60" />
    {{ item.label }}
  </span>
</template>

<script setup>
import { RouterLink } from 'vue-router'

defineProps({
  item: { type: Object, required: true },
})
</script>
