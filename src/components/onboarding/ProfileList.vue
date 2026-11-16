<!-- List of profiles used by the welcome screen ("Choose profile") and the header switcher. -->
<template>
  <ul class="flex flex-col gap-2" data-testid="profile-list">
    <li v-for="profile in profiles" :key="profile.id">
      <button
        type="button"
        :data-testid="`profile-option-${profile.name}`"
        :aria-current="profile.id === activeId ? 'true' : undefined"
        class="flex w-full items-center gap-3 rounded-lg border border-neutral-300 px-3 py-2 text-left hover:bg-neutral-100"
        :class="{
          'border-neutral-800 bg-neutral-100': profile.id === activeId,
        }"
        @click="$emit('select', profile.id)"
      >
        <span class="h-6 w-6 shrink-0 rounded-full border border-neutral-400 bg-white" />
        <span class="min-w-0 flex-1">
          <span class="block truncate text-sm font-semibold text-neutral-900">
            {{ profile.name }}
          </span>
          <span class="block text-xs text-neutral-500">
            {{ getProfileSummary(profile) }}
          </span>
        </span>
        <svg
          v-if="profile.id === activeId"
          class="h-4 w-4 shrink-0 text-neutral-800"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
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
