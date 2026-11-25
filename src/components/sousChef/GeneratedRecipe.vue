<!-- US-28: structured AI recipe with times, servings, ingredient measurements and steps. -->
<template>
  <article
    data-testid="genai-sous-chef-generated-recipe"
    :data-recipe-name="recipe.name"
    aria-labelledby="chef-recipe-title"
  >
    <p class="text-[10px] font-semibold tracking-wider text-neutral-500 uppercase">
      ✦ AI-generated recipe
    </p>
    <h2
      id="chef-recipe-title"
      data-testid="genai-sous-chef-generated-recipe-title"
      class="text-lg font-bold"
    >
      {{ recipe.name }}
    </h2>
    <p class="text-xs text-neutral-500">Original recipe for the {{ profileName }} profile</p>
    <p v-if="recipe.description" class="mt-3 text-sm text-neutral-600">
      {{ recipe.description }}
    </p>

    <dl class="mt-4 grid grid-cols-4 gap-2 text-center">
      <div
        v-for="fact in facts"
        :key="fact.label"
        class="flex flex-col-reverse rounded-lg border border-neutral-300 p-2"
      >
        <dt class="text-[11px] text-neutral-500">{{ fact.label }}</dt>
        <dd class="text-sm font-bold">{{ fact.value }}</dd>
      </div>
    </dl>

    <slot name="badges" />

    <section class="mt-5" aria-labelledby="chef-ingredients-title">
      <h3 id="chef-ingredients-title" class="text-sm font-semibold">
        Ingredients ({{ recipe.ingredients.length }})
      </h3>
      <p class="text-xs text-neutral-500">For {{ formatServings(recipe.servings) }}</p>
      <ul data-testid="genai-sous-chef-generated-ingredients-list" class="mt-2 space-y-1.5">
        <li
          v-for="ingredient in recipe.ingredients"
          :key="ingredient.name"
          data-testid="genai-sous-chef-generated-ingredient-row"
          :data-ingredient-name="ingredient.name"
          class="flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm"
        >
          <span class="min-w-0 flex-1">{{ ingredient.name }}</span>
          <span
            class="rounded px-1.5 py-0.5 text-[10px]"
            :class="ingredient.leftover ? 'bg-neutral-800 text-white' : 'border border-neutral-300'"
            >{{ ingredient.leftover ? 'Leftover' : 'Not in pantry' }}</span
          >
          <span class="w-20 text-right font-semibold">{{ ingredient.measure }}</span>
        </li>
      </ul>
    </section>

    <section class="mt-5" aria-labelledby="chef-steps-title">
      <h3 id="chef-steps-title" class="text-sm font-semibold">Steps ({{ recipe.steps.length }})</h3>
      <ol data-testid="genai-sous-chef-generated-steps-list" class="mt-2 space-y-3">
        <li v-for="(step, index) in recipe.steps" :key="index" class="flex gap-3 text-sm">
          <span
            class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-800 text-xs font-semibold text-white"
            >{{ index + 1 }}</span
          >
          <span>
            {{ step.text }}
            <span
              v-if="step.minutes"
              class="mt-1 block w-fit rounded border border-neutral-300 px-1.5 text-[11px] text-neutral-500"
              >⏱ {{ step.minutes }} min</span
            >
          </span>
        </li>
      </ol>
    </section>

    <p class="mt-4 text-xs text-neutral-500">
      ⓘ AI-generated content. Check ingredients against allergies before cooking.
      <template v-if="recipe.source === 'local'">
        Created by the built-in chef (no GenAI API key configured).
      </template>
    </p>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import { formatServings } from '@/utils/profile'

const props = defineProps({
  recipe: { type: Object, required: true },
  profileName: { type: String, required: true },
})

const facts = computed(() => [
  { label: 'Prep', value: `${props.recipe.prepMinutes} min` },
  { label: 'Cook', value: `${props.recipe.cookMinutes} min` },
  { label: 'Total', value: `${props.recipe.totalMinutes} min` },
  { label: 'Servings', value: props.recipe.servings },
])
</script>
