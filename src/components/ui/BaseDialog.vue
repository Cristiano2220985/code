<!--
  Small modal dialog: closes with Escape, × or a click outside, keeps the focus inside
  and gives it back to the element that opened it.
-->
<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-[2px] sm:items-center sm:p-6"
      @click.self="$emit('close')"
    >
      <section
        v-bind="$attrs"
        ref="dialog"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        tabindex="-1"
        class="max-h-[94dvh] w-full overflow-y-auto rounded-t-[32px] bg-canvas px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] font-sans text-ink shadow-2xl outline-none sm:max-w-sm sm:rounded-[32px] sm:p-6"
        @keydown="onKeydown"
      >
        <span
          class="mx-auto mb-4 block h-1.5 w-10 rounded-full bg-ink/15 sm:hidden"
          aria-hidden="true"
        />
        <div class="flex items-start justify-between gap-3">
          <div>
            <h2 :id="titleId" class="text-[26px] leading-[1.05] font-semibold tracking-[-0.04em]">
              {{ title }}
            </h2>
            <p v-if="description" class="mt-1.5 text-xs text-muted">{{ description }}</p>
          </div>
          <button
            type="button"
            :aria-label="`Close ${title}`"
            class="card pressable flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface text-xl leading-none"
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
