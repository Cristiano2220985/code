<template>
  <div>
    <StepHeading
      title="Create your household profile"
      subtitle="You can add more profiles later."
    />

    <label
      for="profile-name"
      class="mb-1.5 block text-xs font-semibold text-neutral-900"
    >
      Profile name
    </label>
    <input
      id="profile-name"
      v-model="name"
      data-testid="profile-name-input"
      type="text"
      maxlength="40"
      placeholder="e.g. Family"
      class="w-full rounded-lg border bg-neutral-100 px-3 py-2.5 text-sm outline-none focus:border-neutral-800"
      :class="error ? 'border-red-500' : 'border-neutral-300'"
      :aria-invalid="Boolean(error)"
    />
    <p
      v-if="error"
      data-testid="profile-name-error"
      class="mt-1.5 text-xs text-red-600"
    >
      {{ error }}
    </p>

    <div class="mt-8 flex items-center justify-between">
      <div>
        <p class="text-xs font-semibold text-neutral-900">Typical servings</p>
        <p class="text-xs text-neutral-500">People usually eating</p>
      </div>
      <ServingsCounter
        v-model="servings"
        :min="SERVINGS_MIN"
        :max="SERVINGS_MAX"
      />
    </div>
  </div>
</template>

<script setup>
import StepHeading from "./StepHeading.vue";
import ServingsCounter from "@/components/ui/ServingsCounter.vue";
import { SERVINGS_MAX, SERVINGS_MIN } from "@/constants/profileOptions";

const name = defineModel("name", { type: String, required: true });
const servings = defineModel("servings", { type: Number, required: true });

defineProps({
  error: { type: String, default: "" },
});
</script>
