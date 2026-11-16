<template>
  <OnboardingCard>
    <template v-if="!isChoosingProfile">
      <div class="flex flex-1 flex-col items-center justify-center text-center">
        <ImagePlaceholder label="Welcome illustration" size="lg" />
        <h1 class="mt-6 text-xl font-bold text-neutral-900">
          Welcome to SmartPantry
        </h1>
        <p class="mt-2 max-w-56 text-xs text-neutral-500">
          Your kitchen assistant: track your food, waste less and cook smarter.
        </p>
      </div>
    </template>

    <template v-else>
      <h1 class="mb-1 text-lg font-bold text-neutral-900">Choose profile</h1>
      <p class="mb-6 text-xs text-neutral-500">Who is eating today?</p>
      <ProfileList
        v-if="store.hasProfiles"
        :profiles="store.profiles"
        :active-id="store.activeProfileId"
        @select="openProfile"
      />
      <p
        v-else
        data-testid="no-profiles-message"
        class="text-sm text-neutral-500"
      >
        There are no profiles yet. Use "Get started" to create your first one.
      </p>
    </template>

    <template #footer>
      <div class="flex flex-col gap-2">
        <BaseButton
          variant="ghost"
          data-testid="choose-profile-button"
          @click="isChoosingProfile = !isChoosingProfile"
        >
          {{ isChoosingProfile ? "Back" : "Choose profile" }}
        </BaseButton>
        <BaseButton
          data-testid="get-started-button"
          @click="router.push({ name: 'onboarding' })"
        >
          Get started
        </BaseButton>
      </div>
    </template>
  </OnboardingCard>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import OnboardingCard from "@/components/onboarding/OnboardingCard.vue";
import ProfileList from "@/components/onboarding/ProfileList.vue";
import BaseButton from "@/components/ui/BaseButton.vue";
import ImagePlaceholder from "@/components/ui/ImagePlaceholder.vue";
import { useProfilesStore } from "@/stores/profiles";

const store = useProfilesStore();
const router = useRouter();

const isChoosingProfile = ref(false);

function openProfile(id) {
  store.setActiveProfile(id);
  router.push({ name: "pantry" });
}
</script>
