<!-- US-8: a saved recipe in the Recipe Book. The page adds the actions through the slot. -->
<template>
  <article
    data-testid="recipe-card"
    :data-recipe-name="recipe.name"
    class="card flex flex-col overflow-hidden rounded-[30px] bg-surface p-2"
  >
    <div class="relative h-44 overflow-hidden rounded-[24px] bg-tile">
      <img
        v-if="recipe.image"
        :src="recipe.image"
        alt=""
        loading="lazy"
        class="h-full w-full object-cover"
      />
      <span v-else class="flex h-full items-center justify-center text-muted" aria-hidden="true">
        <AppIcon name="recipes" class="h-9 w-9" stroke-width="1.5" />
      </span>
      <span
        class="absolute top-3 left-3 rounded-full bg-lime px-3 py-1.5 text-xs font-semibold text-lime-ink"
        >✓ Saved</span
      >
      <div class="glass absolute inset-x-2 bottom-2 rounded-[20px] px-3.5 py-3">
        <button
          type="button"
          data-testid="recipe-card-title"
          class="text-left text-[17px] leading-snug font-semibold tracking-tight text-ink hover:underline"
          @click="$emit('open', recipe)"
        >
          {{ recipe.name }}
        </button>
        <div class="mt-0.5 flex flex-wrap gap-x-2 text-xs text-ink-soft">
          <span v-if="origin">{{ origin }}</span>
          <span :class="origin && `before:mr-2 before:content-['·']`">{{
            countLabel(recipe.ingredients.length, 'ingredient')
          }}</span>
        </div>
      </div>
    </div>

    <div
      class="flex flex-wrap items-center justify-between gap-2 px-2.5 pt-3.5 pb-1.5 text-xs text-muted"
    >
      <span>{{ note }}</span>
      <div class="flex gap-2">
        <slot name="actions" />
        <button
          type="button"
          class="pressable rounded-full bg-ink px-3.5 py-2 font-medium text-white hover:bg-ink-soft"
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
import AppIcon from '@/components/ui/AppIcon.vue'
import { countLabel, recipeOrigin } from '@/utils/recipeBook'

const props = defineProps({
  recipe: { type: Object, required: true },
  note: { type: String, default: 'Saved in Recipe Book' },
})
defineEmits(['open'])

const origin = computed(() => recipeOrigin(props.recipe))
</script>
