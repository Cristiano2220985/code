<template>
  <DashboardLayout>
    <h1 data-testid="pantry-title" class="text-xl font-bold text-neutral-900">My Pantry</h1>
    <section
      class="mt-6 flex flex-col items-center rounded-xl border border-dashed border-neutral-300 p-10 text-center"
      data-testid="pantry-empty"
    >
      <p class="text-sm font-semibold text-neutral-900">Your pantry is empty</p>
      <p class="mt-1 text-xs text-neutral-500">
        Add your first item to start tracking quantities and expiration dates.
      </p>
    </section>
  </DashboardLayout>
</template>

<script setup>
import DashboardLayout from '@/layouts/DashboardLayout.vue'
</script>
