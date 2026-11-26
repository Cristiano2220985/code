<!-- Main app shell: sidebar (desktop), header with profile switcher and page content. -->
<template>
  <div class="flex min-h-screen bg-canvas">
    <AppSidebar />
    <div class="flex min-w-0 flex-1 flex-col">
      <AppHeader />
      <main class="flex-1 px-5 pt-2 pb-32 md:px-8 md:pb-10" data-testid="dashboard-screen">
        <slot />
      </main>
    </div>
    <AppBottomNav />
  </div>
</template>

<script setup>
import AppBottomNav from '@/components/layout/AppBottomNav.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'
</script>
