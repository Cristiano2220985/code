<!-- Desktop navigation (hidden on small screens, where AppBottomNav is used). -->
<template>
  <aside class="hidden w-56 shrink-0 flex-col border-r border-neutral-300 bg-white p-3 md:flex">
    <div class="mb-6 flex items-center gap-2.5 px-1 py-2">
      <ImagePlaceholder label="SmartPantry logo" size="sm" />
      <span class="text-sm font-semibold text-neutral-900">SmartPantry</span>
    </div>
    <nav class="flex flex-col gap-1" aria-label="Main">
      <NavItem v-for="item in NAV_ITEMS" :key="item.label" :item="item" />
    </nav>
  </aside>
</template>

<script setup>
import NavItem from './NavItem.vue'
import ImagePlaceholder from '@/components/ui/ImagePlaceholder.vue'
import { NAV_ITEMS } from '@/constants/navigation'
</script>
