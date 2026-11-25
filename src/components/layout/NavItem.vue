<!--
  Navigation entry: a router link when the feature exists, otherwise a disabled item.
  Compact (mobile bar): only the active entry shows its label; the others keep it for screen readers.
-->
<template>
  <RouterLink
    v-if="item.routeName"
    :to="{ name: item.routeName }"
    :data-testid="item.testId"
    class="group pressable flex items-center rounded-full text-sm text-muted hover:text-ink"
    :class="spacing"
    active-class="is-active !bg-ink font-medium !text-white"
  >
    <AppIcon :name="item.icon" class="h-5 w-5" />
    <span :class="compact ? 'sr-only group-[.is-active]:not-sr-only' : ''">{{ item.label }}</span>
  </RouterLink>
  <span
    v-else
    :data-testid="item.testId"
    aria-disabled="true"
    title="Coming soon"
    class="flex cursor-not-allowed items-center rounded-full text-sm text-muted/60"
    :class="spacing"
  >
    <AppIcon :name="item.icon" class="h-5 w-5" />
    <span :class="compact ? 'sr-only' : ''">{{ item.label }}</span>
  </span>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import AppIcon from '@/components/ui/AppIcon.vue'

const props = defineProps({
  item: { type: Object, required: true },
  compact: Boolean,
})

const spacing = computed(() =>
  props.compact
    ? 'h-13 flex-1 justify-center gap-2 px-2 [&.is-active]:flex-[2.2]'
    : 'gap-3 px-4 py-2.5',
)
</script>
