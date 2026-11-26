<!-- List of profiles used by the welcome screen ("Choose profile") and the header switcher. -->
<template>
  <ul class="flex flex-col gap-2" data-testid="profile-list">
    <li v-for="profile in profiles" :key="profile.id">
      <button
        type="button"
        :data-testid="`profile-option-${profile.name}`"
        :aria-current="profile.id === activeId ? 'true' : undefined"
        class="pressable flex w-full items-center gap-3 rounded-[22px] bg-surface p-2.5 pr-4 text-left ring-1"
        :class="profile.id === activeId ? 'ring-2 ring-ink' : 'ring-hairline hover:ring-ink/30'"
        @click="$emit('select', profile.id)"
      >
        <span
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
          :class="profile.id === activeId ? 'bg-ink text-white' : 'bg-tile text-ink'"
          aria-hidden="true"
          >{{ profile.name.trim().charAt(0).toUpperCase() }}</span
        >
        <span class="min-w-0 flex-1">
          <span class="block truncate text-[15px] font-semibold text-ink">
            {{ profile.name }}
          </span>
          <span class="mt-0.5 block text-xs text-muted">
            {{ getProfileSummary(profile) }}
          </span>
        </span>
        <svg
          v-if="profile.id === activeId"
          class="h-4 w-4 shrink-0 text-ink"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          aria-label="Active profile"
        >
          <path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
    </li>
  </ul>
</template>

<script setup>
import { getProfileSummary } from '@/utils/profile'

defineProps({
  profiles: { type: Array, required: true },
  activeId: { type: String, default: null },
})

defineEmits(['select'])
</script>
