<!-- Setup flow (steps 1.2 - 1.4): creates a household profile. -->
<template>
  <OnboardingCard>
    <StepProgress :current="step" :total="TOTAL_STEPS" />

    <ProfileBasicsStep
      v-if="step === 1"
      v-model:name="draft.name"
      v-model:servings="draft.servings"
      :error="nameError"
    />
    <DietaryLifestyleStep
      v-else-if="step === 2"
      v-model:lifestyles="draft.lifestyles"
    />
    <AllergiesStep
      v-else
      v-model:allergies="draft.allergies"
      v-model:excluded-ingredients="draft.excludedIngredients"
    />

    <template #footer>
      <div class="flex gap-3">
        <BaseButton
          variant="secondary"
          class="flex-1"
          data-testid="back-button"
          @click="goBack"
        >
          Back
        </BaseButton>
        <BaseButton
          v-if="step < TOTAL_STEPS"
          class="flex-[2]"
          data-testid="next-button"
          @click="goNext"
        >
          Next
        </BaseButton>
        <BaseButton
          v-else
          class="flex-[2]"
          data-testid="finish-button"
          @click="finish"
        >
          Finish setup
        </BaseButton>
      </div>
    </template>
  </OnboardingCard>
</template>

<script setup>
import { reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import AllergiesStep from "@/components/onboarding/AllergiesStep.vue";
import DietaryLifestyleStep from "@/components/onboarding/DietaryLifestyleStep.vue";
import OnboardingCard from "@/components/onboarding/OnboardingCard.vue";
import ProfileBasicsStep from "@/components/onboarding/ProfileBasicsStep.vue";
import StepProgress from "@/components/onboarding/StepProgress.vue";
import BaseButton from "@/components/ui/BaseButton.vue";
import { useProfilesStore } from "@/stores/profiles";
import { createEmptyProfileDraft, validateProfileName } from "@/utils/profile";

const TOTAL_STEPS = 3;

const store = useProfilesStore();
const router = useRouter();
const route = useRoute();

const step = ref(1);
const draft = reactive(createEmptyProfileDraft());
const nameError = ref("");

// Clear the error as soon as the user edits the name.
watch(
  () => draft.name,
  () => (nameError.value = ""),
);

function goNext() {
  if (step.value === 1) {
    nameError.value = validateProfileName(draft.name, store.profiles);
    if (nameError.value) return;
  }

  step.value++;
}

function goBack() {
  if (step.value > 1) {
    step.value--;
    return;
  }

  // Leaving the flow: return to where it was opened from.
  const cameFromDashboard =
    route.query.from === "dashboard" && store.hasProfiles;
  router.push({ name: cameFromDashboard ? "pantry" : "welcome" });
}

function finish() {
  const profile = store.addProfile(draft);
  store.setActiveProfile(profile.id);
  router.push({ name: "pantry" });
}
</script>
