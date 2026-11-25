<!-- US-8: a saved recipe in the Recipe Book. The page adds the actions through the slot. -->
<template>
  <article
    data-testid="recipe-card"
    :data-recipe-name="recipe.name"
    class="rounded-xl border border-neutral-300 bg-white p-4"
  >
    <div class="flex gap-3">
      <img
        v-if="recipe.image"
        :src="`${recipe.image}/preview`"
        alt=""
        loading="lazy"
        class="h-16 w-16 shrink-0 rounded-lg bg-neutral-100 object-cover"
      />
      <ImagePlaceholder v-else :label="recipe.name" size="lg" />
      <div class="min-w-0">
        <button
          type="button"
          data-testid="recipe-card-title"
          class="text-left font-semibold text-neutral-900 underline decoration-neutral-300 underline-offset-2 hover:decoration-neutral-800"
          @click="$emit('open', recipe)"
        >
          {{ recipe.name }}
        </button>
        <div class="mt-1.5 flex flex-wrap gap-1.5 text-xs">
          <span
            v-if="origin"
            class="rounded-md border border-neutral-300 px-2 py-0.5 text-neutral-600"
            >{{ origin }}</span
          >
          <span class="rounded-md border border-neutral-300 px-2 py-0.5 text-neutral-600">{{
            countLabel(recipe.ingredients.length, 'ingredient')
          }}</span>
          <span class="rounded-md bg-neutral-100 px-2 py-0.5 font-semibold text-neutral-700"
            >✓ Saved</span
          >
        </div>
      </div>
    </div>

    <div
      class="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-neutral-200 pt-3 text-xs text-neutral-500"
    >
      <span>{{ note }}</span>
      <div class="flex gap-2">
        <slot name="actions" />
        <button
          type="button"
          class="rounded-lg border border-neutral-400 px-3 py-1.5 font-semibold text-neutral-900 hover:bg-neutral-100"
          @click="$emit('open', recipe)"
        >
          Details →
        </button>
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import ImagePlaceholder from '@/components/ui/ImagePlaceholder.vue'
import { countLabel, recipeOrigin } from '@/utils/recipeBook'

const props = defineProps({
  recipe: { type: Object, required: true },
  note: { type: String, default: 'Saved in Recipe Book' },
})
defineEmits(['open'])

const origin = computed(() => recipeOrigin(props.recipe))
</script>
