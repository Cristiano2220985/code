<!-- Centered card layout shared by the welcome screen and the setup steps. -->
<template>
  <main class="flex min-h-screen flex-col items-center justify-center gap-4 bg-neutral-100 p-4">
    <ImagePlaceholder label="SmartPantry logo" />
    <section
      class="flex min-h-[460px] w-full max-w-sm flex-col rounded-2xl border border-neutral-300 bg-white p-6"
    >
      <slot />
      <footer v-if="$slots.footer" class="mt-auto pt-6">
        <slot name="footer" />
      </footer>
    </section>
  </main>
</template>

<script setup>
import ImagePlaceholder from '@/components/ui/ImagePlaceholder.vue'
</script>
