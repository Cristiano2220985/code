<template>
  <div ref="root" class="relative">
    <button
      type="button"
      data-testid="profile-switcher-toggle"
      class="flex h-11 items-center gap-2 rounded-full bg-surface py-1 pr-3.5 pl-1 text-[15px] font-medium text-ink card pressable"
      :aria-expanded="isOpen"
      aria-haspopup="true"
      @click="isOpen = !isOpen"
    >
      <span
        class="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-sm font-semibold text-white"
        aria-hidden="true"
        >{{ initial }}</span
      >
      <span data-testid="active-profile-name" class="max-w-32 truncate">
        {{ store.activeProfile?.name }}
      </span>
      <AppIcon name="down" class="h-3.5 w-3.5 text-muted" stroke-width="2.5" />
    </button>

    <div
      v-if="isOpen"
      data-testid="profile-switcher-menu"
      class="absolute top-full left-0 z-20 mt-2 w-80 max-w-[calc(100vw-2.5rem)] rounded-3xl bg-surface p-3 shadow-[0_24px_50px_-20px_rgb(0_0_0/0.35)]"
    >
      <p class="mb-3 px-1 text-sm font-semibold text-ink">Switch profile</p>
      <ProfileList
        :profiles="store.profiles"
        :active-id="store.activeProfileId"
        @select="selectProfile"
      />
      <button
        type="button"
        data-testid="add-new-profile-button"
        class="mt-2 w-full rounded-full bg-ink py-2.5 text-sm font-medium text-white hover:bg-ink-soft"
        @click="addProfile"
      >
        + Add new profile
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import ProfileList from '@/components/onboarding/ProfileList.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { useProfilesStore } from '@/stores/profiles'

const store = useProfilesStore()
const initial = computed(() => store.activeProfile?.name?.trim().charAt(0).toUpperCase() ?? '')
const router = useRouter()

const isOpen = ref(false)
const root = ref(null)

function selectProfile(id) {
  store.setActiveProfile(id)
  isOpen.value = false
}

function addProfile() {
  isOpen.value = false
  router.push({ name: 'onboarding', query: { from: 'dashboard' } })
}

function closeOnOutsideClick(event) {
  if (root.value && !root.value.contains(event.target)) {
    isOpen.value = false
  }
}

function closeOnEscape(event) {
  if (event.key === 'Escape') {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', closeOnOutsideClick)
  document.addEventListener('keydown', closeOnEscape)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', closeOnOutsideClick)
  document.removeEventListener('keydown', closeOnEscape)
})
</script>
