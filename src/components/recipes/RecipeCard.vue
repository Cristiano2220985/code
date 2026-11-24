<!-- US-19: one recipe in the discovery results, with its pantry match. -->
<template>
  <article
    data-testid="recipe-card"
    :data-recipe-name="match.recipe.name"
    class="card flex flex-col overflow-hidden rounded-[30px] bg-surface p-2"
  >
    <div class="relative h-52 overflow-hidden rounded-[24px] bg-tile">
      <img
        v-if="match.recipe.image"
        :src="match.recipe.image"
        alt=""
        loading="lazy"
        class="h-full w-full object-cover"
      />
      <span
        v-if="match.usesExpiring.length"
        class="glass absolute top-3 left-3 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-ink before:h-1.5 before:w-1.5 before:rounded-full before:bg-status-today before:content-['']"
        >Uses {{ match.usesExpiring.join(', ') }} · expiring soon</span
      >
      <div class="glass absolute inset-x-2 bottom-2 rounded-[20px] px-3.5 py-3">
        <button
          type="button"
          data-testid="recipe-card-title"
          class="text-left text-[17px] leading-snug font-semibold tracking-tight text-ink hover:underline"
          @click="$emit('open', match)"
        >
          {{ match.recipe.name }}
        </button>
        <div class="mt-0.5 flex flex-wrap gap-x-2 text-xs text-ink-soft">
          <span v-if="origin">{{ origin }}</span>
          <span :class="origin && `before:mr-2 before:content-['·']`">{{
            isVeganRecipe(match.recipe) ? 'Vegan' : 'Contains animal products'
          }}</span>
        </div>
      </div>
    </div>

    <div class="px-2.5 pt-3.5 pb-1.5">
      <div class="flex items-end justify-between gap-3">
        <span class="text-xs text-muted"
          >Pantry match · {{ match.available.length }}/{{ match.total }} ingredients</span
        >
        <span class="text-[26px] leading-none font-semibold tracking-[-0.04em]"
          >{{ match.overlap }}%</span
        >
      </div>
      <div
        class="mt-2 h-1.5 overflow-hidden rounded-full bg-tile"
        role="progressbar"
        :aria-valuenow="match.overlap"
        aria-valuemin="0"
        aria-valuemax="100"
        :aria-label="`${match.overlap}% of the ingredients are in your pantry`"
      >
        <div class="h-full rounded-full bg-ink" :style="{ width: `${match.overlap}%` }" />
      </div>

      <div class="mt-3.5 flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
        <span>{{ missingLabel }}</span>
        <div class="flex gap-2">
          <button
            v-if="match.missing.length"
            type="button"
            class="pressable rounded-full bg-tile px-3.5 py-2 font-medium text-ink hover:bg-hairline"
            @click="$emit('add-missing', match)"
          >
            + Add missing ({{ match.missing.length }})
          </button>
          <button
            type="button"
            class="pressable rounded-full bg-ink px-3.5 py-2 font-medium text-white hover:bg-ink-soft"
            @click="$emit('open', match)"
          >
            View recipe →
          </button>
        </div>
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
