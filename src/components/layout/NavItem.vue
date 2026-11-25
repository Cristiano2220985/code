<!-- Navigation entry: a router link when the feature exists, otherwise a disabled item. -->
<template>
  <RouterLink
    v-if="item.routeName"
    :to="{ name: item.routeName }"
    :data-testid="item.testId"
    class="flex items-center rounded-lg text-sm text-neutral-600 hover:bg-neutral-100"
    :class="[spacing, inSection && ACTIVE_CLASS]"
    :active-class="ACTIVE_CLASS"
  >
    <span v-if="!compact" class="h-3.5 w-3.5 shrink-0 rounded border border-current opacity-60" />
    {{ item.label }}
  </RouterLink>
  <span
    v-else
    :data-testid="item.testId"
    aria-disabled="true"
    title="Coming soon"
    class="flex cursor-not-allowed items-center rounded-lg text-sm text-neutral-400"
    :class="spacing"
  >
    <span v-if="!compact" class="h-3.5 w-3.5 shrink-0 rounded border border-current opacity-60" />
    {{ item.label }}
  </span>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

const props = defineProps({
  item: { type: Object, required: true },
  compact: Boolean,
})

const ACTIVE_CLASS = '!bg-neutral-800 font-semibold !text-white'
const route = useRoute()
// Pages inside a section (e.g. the Sous-Chef inside Recipes) keep the section highlighted.
const inSection = computed(() => route.meta.navSection === props.item.routeName)

const spacing = computed(() =>
  props.compact ? 'min-h-11 justify-center px-1 py-2' : 'gap-2.5 px-3 py-2',
)
</script>
