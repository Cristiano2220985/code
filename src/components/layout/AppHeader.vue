<template>
  <header
    class="flex items-center justify-between px-5 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2 md:px-8 md:pt-6"
  >
    <ProfileSwitcher />
    <button
      type="button"
      data-testid="shopping-list-button"
      :aria-label="`Shopping list, ${shoppingList.items.length} items`"
      title="Shopping list"
      class="relative flex h-11 w-11 items-center justify-center rounded-full bg-surface text-ink card pressable"
      @click="panelOpen = true"
    >
      <AppIcon name="cart" class="h-5 w-5" />
      <span
        v-if="shoppingList.items.length"
        class="absolute -top-0.5 -right-0.5 min-w-[18px] rounded-full bg-ink px-1 text-center text-[10.5px] leading-[18px] font-semibold text-white ring-2 ring-canvas"
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
import AppIcon from '@/components/ui/AppIcon.vue'
import ShoppingListPanel from '@/components/shopping/ShoppingListPanel.vue'
import { useShoppingListStore } from '@/stores/shoppingList'

const shoppingList = useShoppingListStore()
const panelOpen = ref(false)
</script>
