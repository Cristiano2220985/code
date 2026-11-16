<!-- Mobile navigation bar (mobile-first layout). -->
<template>
  <nav
    class="fixed inset-x-0 bottom-0 z-10 grid grid-cols-4 gap-1 border-t border-neutral-300 bg-white p-2 md:hidden"
    aria-label="Main"
  >
    <NavItem
      v-for="item in NAV_ITEMS"
      :key="item.label"
      :item="item"
      class="justify-center"
    />
  </nav>
</template>

<script setup>
import NavItem from "./NavItem.vue";
import { NAV_ITEMS } from "@/constants/navigation";
</script>
