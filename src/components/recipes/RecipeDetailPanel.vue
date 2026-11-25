<!--
  US-19: recipe details with the ingredients in stock, the missing ones and the overlap.
  US-8: the recipe can be saved to the Recipe Book from here.
  Side panel on desktop, full screen on mobile (same pattern as the shopping list).
-->
<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-50 flex justify-end bg-black/35 backdrop-blur-[2px]"
      @click.self="$emit('close')"
    >
      <section
        ref="panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="recipe-detail-title"
        data-testid="recipe-detail-screen"
        :data-recipe-name="match.recipe.name"
        tabindex="-1"
        class="relative flex h-dvh w-full flex-col overflow-hidden bg-canvas font-sans text-ink shadow-2xl md:max-w-md"
        @keydown="onKeydown"
      >
        <div class="flex-1 overflow-y-auto pb-6">
          <div class="relative h-72 bg-tile">
            <img
              v-if="match.recipe.image"
              :src="match.recipe.image"
              alt=""
              class="h-full w-full object-cover"
            />
            <div
              class="absolute inset-x-4 top-[max(1rem,env(safe-area-inset-top))] flex items-center justify-between"
            >
              <p class="glass rounded-full px-3.5 py-2 text-xs font-medium">Recipe details</p>
              <button
                ref="closeButton"
                type="button"
                aria-label="Close recipe details"
                class="glass pressable flex h-10 w-10 items-center justify-center rounded-full text-xl leading-none"
                @click="$emit('close')"
              >
                ×
              </button>
            </div>
          </div>

          <div class="relative -mt-7 rounded-t-[30px] bg-canvas px-5 pt-6">
            <h2
              id="recipe-detail-title"
              class="text-[30px] leading-[1.05] font-semibold tracking-[-0.04em]"
            >
              {{ match.recipe.name }}
            </h2>
            <p class="mt-1.5 text-sm text-muted">
              {{ [match.recipe.category, match.recipe.area].filter(Boolean).join(' · ') }}
            </p>

            <div class="card mt-5 rounded-[26px] bg-surface p-4">
              <div class="flex items-end justify-between">
                <p class="text-sm font-semibold">Ingredient overlap</p>
                <p
                  data-testid="recipe-pantry-overlap-percentage"
                  class="text-[30px] leading-none font-semibold tracking-[-0.04em]"
                >
                  {{ match.overlap }}%
                </p>
              </div>
              <div class="mt-3 h-1.5 overflow-hidden rounded-full bg-tile">
                <div class="h-full rounded-full bg-ink" :style="{ width: `${match.overlap}%` }" />
              </div>
              <p class="mt-2.5 text-xs text-muted">
                {{ match.available.length }} of {{ match.total }} ingredients available in your
                pantry. Calculated from the ingredients required by this recipe.
              </p>
            </div>

            <section
              v-for="group in groups"
              :key="group.status"
              :data-testid="group.testId"
              :aria-labelledby="`recipe-${group.status}-title`"
              class="mt-6"
            >
              <div class="flex items-center justify-between px-1">
                <h3 :id="`recipe-${group.status}-title`" class="text-sm font-semibold">
                  {{ group.icon }} {{ group.title }}
                </h3>
                <span class="text-xs text-muted">{{ countLabel(group.items.length) }}</span>
              </div>
              <p v-if="!group.items.length" class="mt-2 px-1 text-xs text-muted">
                {{ group.empty }}
              </p>
              <ul v-else class="mt-2.5 grid gap-2">
                <li
                  v-for="ingredient in group.items"
                  :key="ingredient.name"
                  data-testid="recipe-ingredient-row"
                  :data-ingredient-name="ingredient.name"
                  class="card flex items-center gap-3 rounded-[20px] bg-surface p-2 pr-3.5 text-sm"
                >
                  <FoodIcon
                    :name="ingredient.name"
                    :category="ingredient.pantryItem?.category"
                    size="sm"
                    rounded="rounded-[14px]"
                  />
                  <span class="min-w-0 flex-1">
                    <span data-testid="recipe-ingredient-name" class="font-medium">{{
                      ingredient.name
                    }}</span>
                    <span v-if="ingredient.pantryItem" class="block text-xs text-muted"
                      >In pantry: {{ quantityLabel(ingredient.pantryItem) }}</span
                    >
                  </span>
                  <span class="text-xs text-muted">{{ ingredient.measure }}</span>
                  <span
                    data-testid="recipe-ingredient-availability-status"
                    :data-status="group.status"
                    class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                    :class="
                      group.status === 'available'
                        ? 'bg-ink text-white'
                        : 'border-[1.5px] border-dashed border-muted'
                    "
                  >
                    <AppIcon
                      v-if="group.status === 'available'"
                      name="check"
                      class="h-3.5 w-3.5"
                      stroke-width="3"
                    />
                    <span class="sr-only">{{
                      group.status === 'available' ? 'Available' : 'Missing'
                    }}</span>
                  </span>
                </li>
              </ul>
            </section>
          </div>
        </div>

        <div
          class="glass m-3 mb-[max(0.75rem,env(safe-area-inset-bottom))] flex flex-col gap-2 rounded-[28px] p-2"
        >
          <p v-if="message" role="status" class="px-2 pt-1 text-center text-xs text-ink-soft">
            {{ message }}
          </p>
          <p v-else role="status" class="sr-only" />
          <SaveRecipeButton :recipe="match.recipe" class="w-full" />
          <BaseButton
            variant="secondary"
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
import AppIcon from '@/components/ui/AppIcon.vue'
import FoodIcon from '@/components/ui/FoodIcon.vue'
import SaveRecipeButton from '@/components/recipeBook/SaveRecipeButton.vue'
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
