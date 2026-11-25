<!-- Shell for the welcome and onboarding screens: brand on top, content, actions pinned at the bottom. -->
<template>
  <main
    class="flex min-h-dvh flex-col items-center bg-canvas px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-[max(1.25rem,env(safe-area-inset-bottom))] md:justify-center md:py-10"
  >
    <div
      class="flex w-full max-w-md items-center gap-2.5 text-[15px] font-semibold tracking-tight"
      role="img"
      aria-label="SmartPantry logo"
    >
      <span class="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-lime">
        <AppIcon name="leaf" class="h-4.5 w-4.5" stroke-width="2" />
      </span>
      <span aria-hidden="true">SmartPantry</span>
    </div>
    <section
      class="mt-6 flex w-full max-w-md flex-1 flex-col md:card md:min-h-[560px] md:flex-none md:rounded-[32px] md:bg-surface md:p-8"
    >
      <slot />
      <footer v-if="$slots.footer" class="mt-auto pt-8">
        <slot name="footer" />
      </footer>
    </section>
  </main>
</template>

<script setup>
import AppIcon from '@/components/ui/AppIcon.vue'
</script>
