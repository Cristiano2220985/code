<template>
  <div ref="root" class="relative">
    <button
      type="button"
      data-testid="profile-switcher-toggle"
      class="flex items-center gap-2 rounded-full border border-neutral-400 py-1 pr-3 pl-1 text-sm font-semibold text-neutral-900 hover:bg-neutral-100"
      :aria-expanded="isOpen"
      aria-haspopup="true"
      @click="isOpen = !isOpen"
    >
      <span class="h-6 w-6 rounded-full border border-neutral-400 bg-white" />
      <span data-testid="active-profile-name" class="max-w-32 truncate">
        {{ store.activeProfile?.name }}
      </span>
      <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
        <path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>

    <div
      v-if="isOpen"
      data-testid="profile-switcher-menu"
      class="absolute top-full left-0 z-20 mt-1 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-neutral-800 bg-white p-3 shadow-lg"
    >
      <p class="mb-3 px-1 text-sm font-semibold text-neutral-900">Switch profile</p>
      <ProfileList
        :profiles="store.profiles"
        :active-id="store.activeProfileId"
        @select="selectProfile"
      />
      <button
        type="button"
        data-testid="add-new-profile-button"
        class="mt-2 w-full rounded-lg border border-neutral-800 py-2 text-sm font-semibold text-neutral-900 hover:bg-neutral-100"
        @click="addProfile"
      >
        + Add new profile
      </button>
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import ProfileList from '@/components/onboarding/ProfileList.vue'
import { useProfilesStore } from '@/stores/profiles'

const store = useProfilesStore()
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
