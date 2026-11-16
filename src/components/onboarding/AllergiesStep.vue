<template>
  <div>
    <StepHeading
      title="Allergies and exclusions"
      subtitle="Recipes containing these are filtered out."
    />
    <!-- Alergies -->
    <p class="mb-2 text-xs font-semibold text-neutral-900">Food allergies</p>
    <div class="flex flex-wrap gap-2" data-testid="allergy-options">
      <SelectableChip
        v-for="option in FOOD_ALLERGENS"
        :key="option.value"
        :label="option.label"
        :selected="allergies.includes(option.value)"
        :data-testid="`allergy-${option.value}`"
        @click="allergies = toggleValue(allergies, option.value)"
      />
    </div>

    <label for="excluded-ingredient" class="mt-6 mb-2 block text-xs font-semibold text-neutral-900">
      Excluded ingredients
    </label>
    <form class="flex gap-2" @submit.prevent="addExcluded">
      <input
        id="excluded-ingredient"
        v-model="newIngredient"
        data-testid="excluded-ingredient-input"
        type="text"
        maxlength="40"
        placeholder="e.g. Mushrooms"
        class="min-w-0 flex-1 rounded-lg border border-neutral-300 bg-neutral-100 px-3 py-2.5 text-sm outline-none focus:border-neutral-800"
      />
      <BaseButton
        type="submit"
        variant="secondary"
        data-testid="excluded-ingredient-add"
        :disabled="!newIngredient.trim()"
      >
        Add
      </BaseButton>
    </form>
    <p v-if="error" data-testid="excluded-ingredient-error" class="mt-1.5 text-xs text-red-600">
      {{ error }}
    </p>

    <ul class="mt-3 flex flex-wrap gap-2" data-testid="excluded-ingredient-list">
      <li
        v-for="ingredient in excludedIngredients"
        :key="ingredient"
        :data-testid="`excluded-${ingredient}`"
        class="flex items-center gap-1.5 rounded-full border border-neutral-400 px-3.5 py-1.5 text-xs text-neutral-700"
      >
        <span>{{ ingredient }}</span>
        <button
          type="button"
          class="text-neutral-400 hover:text-neutral-800"
          :aria-label="`Remove ${ingredient}`"
          :data-testid="`remove-excluded-${ingredient}`"
          @click="removeExcluded(ingredient)"
        >
          &times;
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import StepHeading from './StepHeading.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import SelectableChip from '@/components/ui/SelectableChip.vue'
import { FOOD_ALLERGENS } from '@/constants/profileOptions'
import { addIngredient, hasIngredient, toggleValue } from '@/utils/profile'

const allergies = defineModel('allergies', { type: Array, required: true })
const excludedIngredients = defineModel('excludedIngredients', {
  type: Array,
  required: true,
})

const newIngredient = ref('')
const error = ref('')

function addExcluded() {
  if (hasIngredient(excludedIngredients.value, newIngredient.value)) {
    error.value = 'This ingredient is already excluded.'
    return
  }

  excludedIngredients.value = addIngredient(excludedIngredients.value, newIngredient.value)
  newIngredient.value = ''
  error.value = ''
}

function removeExcluded(ingredient) {
  excludedIngredients.value = excludedIngredients.value.filter((item) => item !== ingredient)
}
</script>
