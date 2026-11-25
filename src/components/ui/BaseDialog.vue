<!--
  Small modal dialog: closes with Escape, × or a click outside, keeps the focus inside
  and gives it back to the element that opened it.
-->
<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
      @click.self="$emit('close')"
    >
      <section
        v-bind="$attrs"
        ref="dialog"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        tabindex="-1"
        class="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl"
        @keydown="onKeydown"
      >
        <div class="flex items-start justify-between gap-3">
          <div>
            <h2 :id="titleId" class="text-lg font-bold">{{ title }}</h2>
            <p v-if="description" class="mt-1 text-xs text-neutral-500">{{ description }}</p>
          </div>
          <button
            type="button"
            :aria-label="`Close ${title}`"
            class="rounded p-1 text-xl leading-none hover:bg-neutral-100"
            @click="$emit('close')"
          >
            ×
          </button>
        </div>
        <slot />
      </section>
    </div>
  </Teleport>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, useId } from 'vue'
import { trapDialogTab } from '@/utils/dialogFocus'

// Attributes such as data-testid belong to the dialog box, not to the backdrop.
defineOptions({ inheritAttrs: false })

defineProps({
  title: { type: String, required: true },
  description: { type: String, default: '' },
})
const emit = defineEmits(['close'])

const titleId = useId()
const dialog = ref(null)
let previousFocus = null

function onKeydown(event) {
  if (event.key === 'Escape') {
    event.stopPropagation()
    emit('close')
  }
  trapDialogTab(event, dialog.value)
}

onMounted(() => {
  previousFocus = document.activeElement
  const target = dialog.value.querySelector('[autofocus]') ?? dialog.value
  target.focus()
})
onBeforeUnmount(() => previousFocus?.focus())
</script>
