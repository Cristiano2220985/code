<!--
  US-28: who the recipe is for, the profile's dietary constraints, the serving size and an
  optional note for the chef.
-->
<template>
  <section aria-labelledby="chef-preferences-title" class="mt-6 border-t border-neutral-200 pt-5">
    <h2 id="chef-preferences-title" class="font-semibold">Cooking for {{ profile.name }}</h2>
    <p class="text-xs text-neutral-500">The recipe will respect this profile.</p>

    <p
      v-for="ingredient in removed"
      :key="ingredient.name"
      data-testid="genai-sous-chef-removed-ingredient"
      class="mt-3 rounded-lg border border-neutral-700 px-3 py-2 text-xs"
    >
      ⚠ <b>{{ ingredient.name }}</b> was removed: it conflicts with the {{ ingredient.reason }} of
      this profile.
    </p>

    <dl class="mt-4 rounded-lg border border-neutral-300 p-3 text-sm">
      <div class="flex items-baseline justify-between">
        <dt class="font-semibold">Dietary constraints</dt>
        <dd class="text-xs text-neutral-500">From active profile</dd>
      </div>
      <div v-for="row in constraints" :key="row.label" class="mt-2 flex gap-3">
        <dt class="w-36 shrink-0 text-xs text-neutral-500">{{ row.label }}</dt>
        <dd class="text-xs font-medium">{{ row.values.join(', ') || row.empty }}</dd>
      </div>
      <p class="mt-3 text-xs text-neutral-500">
        ⓘ To cook for someone else, switch profile in the header. Constraints update automatically.
      </p>
    </dl>

    <div class="mt-4 flex items-center justify-between rounded-lg border border-neutral-300 p-3">
      <div>
        <p class="text-sm font-semibold">Servings</p>
        <p class="text-xs text-neutral-500">
          Profile default: {{ profile.servings }} · portions and quantities scale to this
        </p>
      </div>
      <ServingsCounter v-model="servings" :min="SERVINGS_MIN" :max="SERVINGS_MAX" />
    </div>

    <label for="chef-note" class="mt-4 flex items-baseline justify-between text-sm font-semibold">
      Note for the chef <span class="text-xs font-normal text-neutral-500">Optional</span>
    </label>
    <input
      id="chef-note"
      v-model="note"
      type="text"
      autocomplete="off"
      maxlength="120"
      placeholder="e.g. something warm, under 30 minutes"
      class="mt-2 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-800 focus:ring-1 focus:ring-neutral-800"
    />
  </section>
</template>

<script setup>
import { computed } from 'vue'
import ServingsCounter from '@/components/ui/ServingsCounter.vue'
import { SERVINGS_MAX, SERVINGS_MIN } from '@/constants/profileOptions'
import { profileConstraints } from '@/utils/sousChef'

const props = defineProps({
  profile: { type: Object, required: true },
  // Selected leftovers left out because they break the profile: [{ name, reason }]
  removed: { type: Array, default: () => [] },
})
const servings = defineModel('servings', { type: Number, required: true })
const note = defineModel('note', { type: String, required: true })

const constraints = computed(() => {
  const { lifestyles, allergies, excluded } = profileConstraints(props.profile)
  return [
    { label: 'Lifestyle', values: lifestyles, empty: 'No restriction' },
    { label: 'Allergies', values: allergies, empty: 'None' },
    { label: 'Excluded ingredients', values: excluded, empty: 'None' },
  ]
})
</script>
