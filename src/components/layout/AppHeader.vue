<template>
  <header
    class="flex items-center justify-between border-b border-neutral-300 bg-white px-4 py-3 md:px-6"
  >
    <ProfileSwitcher />
    <button
      type="button"
      data-testid="shopping-list-button"
      :aria-label="`Shopping list, ${shoppingList.items.length} items`"
      title="Shopping list"
      class="relative flex h-8 w-8 items-center justify-center rounded-full border border-neutral-400 text-neutral-700 hover:border-neutral-800"
      @click="panelOpen = true"
    >
      <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 4h2l2.4 11h11.2L21 7H6.2" stroke-linecap="round" stroke-linejoin="round" />
        <circle cx="9" cy="19.5" r="1.3" />
        <circle cx="17" cy="19.5" r="1.3" />
      </svg>
      <span
        v-if="shoppingList.items.length"
        class="absolute -right-1.5 -top-1.5 min-w-4 rounded-full bg-neutral-800 px-1 text-center text-[10px] font-semibold leading-4 text-white"
        aria-hidden="true"
        >{{ shoppingList.items.length }}</span
      >
    </button>
    <ShoppingListPanel v-if="panelOpen" @close="panelOpen = false" />
  </header>
</template>

<script setup>
import { ref } from 'vue'
import ProfileSwitcher from './ProfileSwitcher.vue'
import ShoppingListPanel from '@/components/shopping/ShoppingListPanel.vue'
import { useShoppingListStore } from '@/stores/shoppingList'

const shoppingList = useShoppingListStore()
const panelOpen = ref(false)
</script>
