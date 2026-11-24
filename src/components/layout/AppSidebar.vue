<!-- Desktop navigation (hidden on small screens, where AppBottomNav is used). -->
<template>
  <aside class="hidden w-60 shrink-0 flex-col p-4 md:flex">
    <div class="mb-8 flex items-center gap-2.5 px-2 py-2">
      <span class="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-white">
        <AppIcon name="leaf" class="h-4.5 w-4.5" />
      </span>
      <span class="text-[15px] font-semibold tracking-tight text-ink">SmartPantry</span>
    </div>
    <nav class="flex flex-col gap-1" aria-label="Main">
      <NavItem v-for="item in NAV_ITEMS" :key="item.label" :item="item" />
    </nav>
  </aside>
</template>

<script setup>
import NavItem from './NavItem.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { NAV_ITEMS } from '@/constants/navigation'
</script>
