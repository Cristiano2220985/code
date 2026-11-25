<!-- US-28: who the recipe is for, the serving size and an optional note for the chef. -->
<template>
  <section aria-labelledby="chef-preferences-title" class="mt-6 border-t border-neutral-200 pt-5">
    <h2 id="chef-preferences-title" class="font-semibold">Cooking for {{ profile.name }}</h2>
    <p class="text-xs text-neutral-500">The recipe will respect this profile.</p>

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
import ServingsCounter from '@/components/ui/ServingsCounter.vue'
import { SERVINGS_MAX, SERVINGS_MIN } from '@/constants/profileOptions'

defineProps({
  profile: { type: Object, required: true },
})
const servings = defineModel('servings', { type: Number, required: true })
const note = defineModel('note', { type: String, required: true })
</script>
