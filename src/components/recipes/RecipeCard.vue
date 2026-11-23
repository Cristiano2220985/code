<!-- US-19: one recipe in the discovery results, with its pantry match. -->
<template>
  <article
    data-testid="recipe-card"
    :data-recipe-name="match.recipe.name"
    class="flex flex-col rounded-xl border bg-white p-4"
    :class="match.usesExpiring.length ? 'border-neutral-700' : 'border-neutral-300'"
  >
    <div class="flex gap-3">
      <img
        v-if="match.recipe.image"
        :src="`${match.recipe.image}/preview`"
        alt=""
        loading="lazy"
        class="h-16 w-16 shrink-0 rounded-lg bg-neutral-100 object-cover"
      />
      <div class="min-w-0">
        <button
          type="button"
          data-testid="recipe-card-title"
          class="text-left font-semibold text-neutral-900 underline decoration-neutral-300 underline-offset-2 hover:decoration-neutral-800"
          @click="$emit('open', match)"
        >
          {{ match.recipe.name }}
        </button>
        <div class="mt-1.5 flex flex-wrap gap-1.5 text-xs">
          <span
            v-if="origin"
            class="rounded-md border border-neutral-300 px-2 py-0.5 text-neutral-600"
            >{{ origin }}</span
          >
          <span class="rounded-md border border-neutral-300 px-2 py-0.5 text-neutral-600">{{
            isVeganRecipe(match.recipe) ? 'Vegan' : 'Contains animal products'
          }}</span>
          <span
            v-if="match.usesExpiring.length"
            class="rounded-md border-2 border-neutral-700 px-2 py-0.5 font-semibold text-neutral-900"
            >Uses {{ match.usesExpiring.join(', ') }} · expiring soon</span
          >
        </div>
      </div>
    </div>

    <div class="mt-4 flex items-end justify-between text-xs text-neutral-600">
      <span>Pantry match · {{ match.available.length }}/{{ match.total }} ingredients</span>
      <span class="text-lg font-bold text-neutral-900">{{ match.overlap }}%</span>
    </div>
    <div
      class="mt-1 h-1.5 overflow-hidden rounded-full bg-neutral-200"
      role="progressbar"
      :aria-valuenow="match.overlap"
      aria-valuemin="0"
      aria-valuemax="100"
      :aria-label="`${match.overlap}% of the ingredients are in your pantry`"
    >
      <div class="h-full rounded-full bg-neutral-700" :style="{ width: `${match.overlap}%` }" />
    </div>

    <div class="flex-1" />
    <div
      class="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-neutral-200 pt-3 text-xs text-neutral-500"
    >
      <span>{{ missingLabel }}</span>
      <div class="flex gap-2">
        <button
          v-if="match.missing.length"
          type="button"
          class="rounded-lg border border-neutral-400 px-3 py-1.5 font-semibold text-neutral-900 hover:bg-neutral-100"
          @click="$emit('add-missing', match)"
        >
          + Add missing ({{ match.missing.length }})
        </button>
        <button
          type="button"
          class="rounded-lg border border-neutral-400 px-3 py-1.5 font-semibold text-neutral-900 hover:bg-neutral-100"
          @click="$emit('open', match)"
        >
          View recipe →
        </button>
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import { isVeganRecipe } from '@/utils/recipes'

const props = defineProps({
  match: { type: Object, required: true },
})
defineEmits(['open', 'add-missing'])

const origin = computed(() =>
  [props.match.recipe.category, props.match.recipe.area].filter(Boolean).join(' · '),
)
const missingLabel = computed(() => {
  const count = props.match.missing.length
  if (!count) return 'You have every ingredient'
  return `${count} missing ${count === 1 ? 'ingredient' : 'ingredients'}`
})
</script>
