<!-- Mobile navigation bar: floating frosted pill (mobile-first layout). -->
<template>
  <nav
    class="glass fixed inset-x-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-10 flex items-center gap-1 rounded-full p-1.5 md:hidden"
    aria-label="Main"
  >
    <NavItem v-for="item in NAV_ITEMS" :key="item.label" :item="item" compact />
  </nav>
</template>

<script setup>
import NavItem from './NavItem.vue'
import { NAV_ITEMS } from '@/constants/navigation'
</script>
