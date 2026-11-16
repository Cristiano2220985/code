<!-- Main app shell: sidebar (desktop), header with profile switcher and page content. -->
<template>
  <div class="flex min-h-screen bg-white">
    <AppSidebar />
    <div class="flex min-w-0 flex-1 flex-col">
      <AppHeader />
      <main class="flex-1 p-4 pb-24 md:p-6">
        <slot />
      </main>
    </div>
    <AppBottomNav />
  </div>
</template>

<script setup>
import AppBottomNav from "@/components/layout/AppBottomNav.vue";
import AppHeader from "@/components/layout/AppHeader.vue";
import AppSidebar from "@/components/layout/AppSidebar.vue";
</script>
