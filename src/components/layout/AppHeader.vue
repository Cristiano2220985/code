<template>
  <header
    class="flex items-center justify-between border-b border-neutral-300 bg-white px-4 py-3 md:px-6"
  >
    <ProfileSwitcher />
    <button
      type="button"
      data-testid="shopping-list-button"
      aria-label="Shopping list"
      title="Shopping list (coming soon)"
      disabled
      class="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-400 text-neutral-700 disabled:cursor-not-allowed"
    >
      <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 4h2l2.4 11h11.2L21 7H6.2" stroke-linecap="round" stroke-linejoin="round" />
        <circle cx="9" cy="19.5" r="1.3" />
        <circle cx="17" cy="19.5" r="1.3" />
      </svg>
    </button>
  </header>
</template>

<script setup>
import ProfileSwitcher from './ProfileSwitcher.vue'
</script>
