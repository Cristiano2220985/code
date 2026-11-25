<template>
  <OnboardingCard>
    <template v-if="!isChoosingProfile">
      <div class="flex flex-1 flex-col justify-center">
        <div
          class="grid grid-cols-3 gap-2.5 rounded-[32px] bg-lime p-4"
          role="img"
          aria-label="Welcome illustration"
        >
          <FoodIcon
            v-for="food in WELCOME_FOODS"
            :key="food"
            :name="food"
            rounded="rounded-[22px]"
            class="aspect-square !h-auto !w-auto !bg-white/60 !text-lime-ink"
          />
        </div>
        <h1 class="mt-8 text-[40px] leading-[1.02] font-semibold tracking-[-0.045em] text-ink">
          Welcome to SmartPantry
        </h1>
        <p class="mt-3 max-w-72 text-[15px] leading-relaxed text-muted">
          Your kitchen assistant: track your food, waste less and cook smarter.
        </p>
      </div>
    </template>

    <template v-else>
      <h1 class="text-[32px] leading-[1.05] font-semibold tracking-[-0.04em] text-ink">
        Choose profile
      </h1>
      <p class="mt-2 mb-7 text-sm text-muted">Who is eating today?</p>
      <ProfileList
        v-if="store.hasProfiles"
        :profiles="store.profiles"
        :active-id="store.activeProfileId"
        @select="openProfile"
      />
      <p
        v-else
        data-testid="no-profiles-message"
        class="rounded-[22px] bg-surface p-4 text-sm text-muted"
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
          {{ isChoosingProfile ? 'Back' : 'Choose profile' }}
        </BaseButton>
        <BaseButton data-testid="get-started-button" @click="router.push({ name: 'onboarding' })">
          Get started
        </BaseButton>
      </div>
    </template>
  </OnboardingCard>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import OnboardingCard from '@/components/onboarding/OnboardingCard.vue'
import ProfileList from '@/components/onboarding/ProfileList.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import FoodIcon from '@/components/ui/FoodIcon.vue'
import { useProfilesStore } from '@/stores/profiles'

const store = useProfilesStore()
const router = useRouter()

const isChoosingProfile = ref(false)
const WELCOME_FOODS = ['Eggs', 'Carrot', 'Cheese', 'Fish', 'Apple', 'Bread']

function openProfile(id) {
  store.setActiveProfile(id)
  router.push({ name: 'pantry' })
}
</script>
