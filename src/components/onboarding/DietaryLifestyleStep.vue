<template>
  <div>
    <StepHeading title="Dietary lifestyle" subtitle="Recipes will be adapted to these choices." />

    <div class="flex flex-wrap gap-2" data-testid="lifestyle-options">
      <SelectableChip
        :label="NO_RESTRICTIONS_LABEL"
        :selected="lifestyles.length === 0"
        data-testid="lifestyle-none"
        @click="lifestyles = []"
      />
      <SelectableChip
        v-for="option in DIETARY_LIFESTYLES"
        :key="option.value"
        :label="option.label"
        :selected="lifestyles.includes(option.value)"
        :data-testid="`lifestyle-${option.value}`"
        @click="lifestyles = toggleValue(lifestyles, option.value)"
      />
    </div>
  </div>
</template>

<script setup>
import StepHeading from './StepHeading.vue'
import SelectableChip from '@/components/ui/SelectableChip.vue'
import { DIETARY_LIFESTYLES, NO_RESTRICTIONS_LABEL } from '@/constants/profileOptions'
import { toggleValue } from '@/utils/profile'

// An empty list means "No restrictions".
const lifestyles = defineModel('lifestyles', { type: Array, required: true })
</script>
