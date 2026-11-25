<!-- US-28: what was sent to the GenAI API, shown while waiting and when it fails. -->
<template>
  <dl class="rounded-xl border border-neutral-300 p-4 text-sm">
    <div v-for="row in rows" :key="row.label" class="flex gap-3 py-1">
      <dt class="w-24 shrink-0 text-xs text-neutral-500">{{ row.label }}</dt>
      <dd class="min-w-0 font-medium">{{ row.value }}</dd>
    </div>
  </dl>
</template>

<script setup>
import { computed } from 'vue'
import { ingredientNames, mustAvoid } from '@/utils/sousChef'

const props = defineProps({
  request: { type: Object, required: true },
})

const rows = computed(() =>
  [
    { label: 'Ingredients', value: ingredientNames(props.request).join(', ') },
    { label: 'Servings', value: props.request.servings },
    { label: 'Must avoid', value: mustAvoid(props.request.profile).join(', ') },
    { label: 'Note', value: props.request.note },
  ].filter((row) => row.value),
)
</script>
