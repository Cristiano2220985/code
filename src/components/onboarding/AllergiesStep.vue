<template>
  <div>
    <StepHeading
      title="Allergies and exclusions"
      subtitle="Recipes containing these are filtered out."
    />
    <!-- Alergies -->
    <p class="mb-3 text-sm font-medium text-ink">Food allergies</p>
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

    <label for="excluded-ingredient" class="mt-8 mb-3 block text-sm font-medium text-ink">
      Excluded ingredients
    </label>
    <form class="card flex gap-2 rounded-full bg-surface p-1.5 pl-4" @submit.prevent="addExcluded">
      <input
        id="excluded-ingredient"
        v-model="newIngredient"
        data-testid="excluded-ingredient-input"
        type="text"
        maxlength="40"
        placeholder="e.g. Mushrooms"
        class="min-w-0 flex-1 bg-transparent py-2 outline-none placeholder:text-muted"
      />
      <BaseButton
        type="submit"
        data-testid="excluded-ingredient-add"
        class="!px-5 !py-2.5"
        :disabled="!newIngredient.trim()"
      >
        Add
      </BaseButton>
    </form>
    <p
      v-if="error"
      data-testid="excluded-ingredient-error"
      class="mt-2 px-1 text-xs text-status-today"
    >
      {{ error }}
    </p>

    <ul class="mt-3 flex flex-wrap gap-2" data-testid="excluded-ingredient-list">
      <li
        v-for="ingredient in excludedIngredients"
        :key="ingredient"
        :data-testid="`excluded-${ingredient}`"
        class="flex h-10 items-center gap-1 rounded-full bg-ink/[0.06] pr-1.5 pl-4 text-sm text-ink"
      >
        <span>{{ ingredient }}</span>
        <button
          type="button"
          class="pressable flex h-7 w-7 items-center justify-center rounded-full text-base text-muted hover:bg-surface hover:text-ink"
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
