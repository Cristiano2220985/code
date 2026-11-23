<!--
  US-19: recipe details with the ingredients in stock, the missing ones and the overlap.
  Side panel on desktop, full screen on mobile (same pattern as the shopping list).
-->
<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex justify-end bg-black/30" @click.self="$emit('close')">
      <section
        ref="panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="recipe-detail-title"
        data-testid="recipe-detail-screen"
        :data-recipe-name="match.recipe.name"
        tabindex="-1"
        class="flex h-dvh w-full flex-col bg-white shadow-xl md:max-w-md"
        @keydown="onKeydown"
      >
        <div class="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
          <p class="text-sm font-semibold">Recipe details</p>
          <button
            ref="closeButton"
            type="button"
            aria-label="Close recipe details"
            class="rounded p-2 text-xl hover:bg-neutral-100"
            @click="$emit('close')"
          >
            ×
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-5">
          <div class="flex gap-4">
            <img
              v-if="match.recipe.image"
              :src="`${match.recipe.image}/preview`"
              alt=""
              class="h-20 w-20 shrink-0 rounded-lg bg-neutral-100 object-cover"
            />
            <div>
              <h2 id="recipe-detail-title" class="text-lg font-bold">{{ match.recipe.name }}</h2>
              <p class="mt-1 text-xs text-neutral-500">
                {{ [match.recipe.category, match.recipe.area].filter(Boolean).join(' · ') }}
              </p>
            </div>
          </div>

          <div class="mt-5 rounded-xl border border-neutral-300 p-4">
            <div class="flex items-center justify-between">
              <p class="text-sm font-semibold">Ingredient overlap</p>
              <p data-testid="recipe-pantry-overlap-percentage" class="text-2xl font-bold">
                {{ match.overlap }}%
              </p>
            </div>
            <div class="mt-2 h-2 overflow-hidden rounded-full bg-neutral-200">
              <div
                class="h-full rounded-full bg-neutral-700"
                :style="{ width: `${match.overlap}%` }"
              />
            </div>
            <p class="mt-2 text-xs text-neutral-500">
              {{ match.available.length }} of {{ match.total }} ingredients available in your
              pantry. Calculated from the ingredients required by this recipe.
            </p>
          </div>

          <section
            v-for="group in groups"
            :key="group.status"
            :data-testid="group.testId"
            :aria-labelledby="`recipe-${group.status}-title`"
            class="mt-5 border-t border-neutral-200 pt-3"
          >
            <div class="flex items-center justify-between">
              <h3 :id="`recipe-${group.status}-title`" class="text-sm font-semibold">
                {{ group.icon }} {{ group.title }}
              </h3>
              <span class="text-xs text-neutral-500">{{ countLabel(group.items.length) }}</span>
            </div>
            <p v-if="!group.items.length" class="mt-2 text-xs text-neutral-500">
              {{ group.empty }}
            </p>
            <ul class="mt-1">
              <li
                v-for="ingredient in group.items"
                :key="ingredient.name"
                data-testid="recipe-ingredient-row"
                :data-ingredient-name="ingredient.name"
                class="flex items-center gap-3 py-2 text-sm"
              >
                <span
                  data-testid="recipe-ingredient-availability-status"
                  :data-status="group.status"
                  class="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 text-[9px]"
                  :class="
                    group.status === 'available' ? 'border-neutral-800' : 'border-neutral-400'
                  "
                >
                  <svg
                    v-if="group.status === 'available'"
                    aria-hidden="true"
                    class="h-2.5 w-2.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="4"
                  >
                    <path d="M5 12l5 5L20 7" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                  <span class="sr-only">{{
                    group.status === 'available' ? 'Available' : 'Missing'
                  }}</span>
                </span>
                <span class="min-w-0 flex-1">
                  <span data-testid="recipe-ingredient-name">{{ ingredient.name }}</span>
                  <span v-if="ingredient.pantryItem" class="block text-xs text-neutral-500"
                    >In pantry: {{ quantityLabel(ingredient.pantryItem) }}</span
                  >
                </span>
                <span class="text-xs text-neutral-500">{{ ingredient.measure }}</span>
              </li>
            </ul>
          </section>
        </div>

        <div class="border-t border-neutral-200 p-4">
          <p role="status" class="mb-2 text-center text-xs text-neutral-600">{{ message }}</p>
          <BaseButton
            class="w-full"
            :disabled="!match.missing.length"
            @click="$emit('add-missing', match)"
          >
            + Add missing to list ({{ match.missing.length }})
          </BaseButton>
        </div>
      </section>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { UNIT_LABELS } from '@/utils/pantry'

const props = defineProps({
  match: { type: Object, required: true },
  message: { type: String, default: '' },
})
const emit = defineEmits(['close', 'add-missing'])

const panel = ref(null),
  closeButton = ref(null)
let previousFocus = null,
  previousOverflow = ''

const groups = computed(() => [
  {
    status: 'available',
    title: 'Available in your pantry',
    icon: '✓',
    testId: 'recipe-available-ingredients-section',
    items: props.match.available,
    empty: 'None of the ingredients are in your pantry.',
  },
  {
    status: 'missing',
    title: 'Missing ingredients',
    icon: '✕',
    testId: 'recipe-missing-ingredients-section',
    items: props.match.missing,
    empty: 'You have every ingredient.',
  },
])

const countLabel = (count) => `${count} ${count === 1 ? 'ingredient' : 'ingredients'}`
const quantityLabel = (item) => `${item.quantity} ${UNIT_LABELS[item.unit] ?? item.unit}`

function onKeydown(event) {
  if (event.key === 'Escape') {
    event.stopPropagation()
    emit('close')
  }
  if (event.key !== 'Tab') return
  const controls = [...panel.value.querySelectorAll('button')].filter(
    (element) => !element.disabled,
  )
  const first = controls[0],
    last = controls.at(-1)
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}
onMounted(() => {
  previousFocus = document.activeElement
  previousOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
  closeButton.value?.focus()
})
onBeforeUnmount(() => {
  document.body.style.overflow = previousOverflow
  previousFocus?.focus()
})
</script>
