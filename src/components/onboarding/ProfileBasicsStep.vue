<template>
  <div>
    <StepHeading
      title="Create your household profile"
      subtitle="You can add more profiles later."
    />

    <label for="profile-name" class="mb-2 block text-sm font-medium text-ink"> Profile name </label>
    <input
      id="profile-name"
      v-model="name"
      data-testid="profile-name-input"
      type="text"
      maxlength="40"
      placeholder="e.g. Family"
      class="card h-13 w-full rounded-2xl bg-surface px-4 ring-1 outline-none placeholder:text-muted focus:ring-2 focus:ring-ink"
      :class="error ? 'ring-status-today' : 'ring-transparent'"
      :aria-invalid="Boolean(error)"
    />
    <p v-if="error" data-testid="profile-name-error" class="mt-2 text-xs text-status-today">
      {{ error }}
    </p>

    <div class="mt-8 flex items-center justify-between gap-4">
      <div>
        <p class="text-sm font-medium text-ink">Typical servings</p>
        <p class="mt-0.5 text-xs text-muted">People usually eating</p>
      </div>
      <ServingsCounter v-model="servings" :min="SERVINGS_MIN" :max="SERVINGS_MAX" />
    </div>
  </div>
</template>

<script setup>
import StepHeading from './StepHeading.vue'
import ServingsCounter from '@/components/ui/ServingsCounter.vue'
import { SERVINGS_MAX, SERVINGS_MIN } from '@/constants/profileOptions'

const name = defineModel('name', { type: String, required: true })
const servings = defineModel('servings', { type: Number, required: true })

defineProps({
  error: { type: String, default: '' },
})
</script>
