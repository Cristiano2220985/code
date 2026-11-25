<!-- US-28: chooses the pantry leftovers (expiring items first) and extra scraps for the chef. -->
<template>
  <section aria-labelledby="chef-leftovers-title">
    <h2 id="chef-leftovers-title" class="font-semibold">Leftovers</h2>
    <p class="text-xs text-neutral-500">Select the leftovers the chef must combine.</p>

    <p v-if="!items.length" class="mt-3 rounded-lg bg-neutral-50 p-3 text-xs text-neutral-500">
      Your pantry is empty. Add items to the pantry or type the scraps you have below.
    </p>

    <div data-testid="genai-sous-chef-pantry-ingredients-list">
      <div v-for="group in groups" :key="group.title" class="mt-4">
        <div class="flex items-baseline justify-between">
          <h3 class="text-sm font-semibold">{{ group.title }}</h3>
          <span class="text-xs text-neutral-500">{{ group.hint }}</span>
        </div>
        <ul class="mt-2 space-y-2">
          <li v-for="item in group.items" :key="item.id">
            <button
              type="button"
              data-testid="genai-sous-chef-ingredient-option"
              :data-ingredient-name="item.name"
              :aria-pressed="isSelected(item)"
              class="flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left"
              :class="
                isSelected(item) ? 'border-2 border-neutral-800' : 'border-neutral-300 bg-white'
              "
              @click="toggle(item)"
            >
              <span
                aria-hidden="true"
                class="flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px]"
                :class="
                  isSelected(item)
                    ? 'border-neutral-800 bg-neutral-800 text-white'
                    : 'border-neutral-400'
                "
                >{{ isSelected(item) ? '✓' : '' }}</span
              >
              <span class="min-w-0 flex-1">
                <span class="block text-sm font-semibold">{{ item.name }}</span>
                <span class="block text-xs text-neutral-500">{{ detail(item) }}</span>
              </span>
              <span class="text-xs text-neutral-700">{{ quantityLabel(item) }}</span>
            </button>
          </li>
        </ul>
      </div>
    </div>

    <form class="mt-5" novalidate @submit.prevent="addScrap">
      <div class="flex items-baseline justify-between">
        <label for="chef-scrap" class="text-sm font-semibold">Other scraps</label>
        <span class="text-xs text-neutral-500">Not in pantry</span>
      </div>
      <div class="mt-2 flex gap-2">
        <input
          id="chef-scrap"
          v-model="scrap"
          type="text"
          autocomplete="off"
          maxlength="40"
          placeholder="e.g. half an onion"
          class="min-w-0 flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-800 focus:ring-1 focus:ring-neutral-800"
        />
        <BaseButton type="submit" variant="secondary" :disabled="!scrap.trim()">+ Add</BaseButton>
      </div>
      <ul v-if="scraps.length" class="mt-2 flex flex-wrap gap-1.5" aria-label="Other scraps">
        <li v-for="name in scraps" :key="name">
          <button
            type="button"
            class="rounded-full bg-neutral-800 px-3 py-1 text-xs font-semibold text-white"
            :aria-label="`Remove ${name}`"
            @click="scraps = scraps.filter((entry) => entry !== name)"
          >
            {{ name }} ✕
          </button>
        </li>
      </ul>
    </form>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { expirationLabel } from '@/utils/pantry'
import { addIngredient, toggleValue } from '@/utils/profile'
import { groupPantryItems, isUseSoon, quantityLabel } from '@/utils/sousChef'

const props = defineProps({
  items: { type: Array, required: true },
  today: { type: Date, default: () => new Date() },
})
const selectedIds = defineModel('selectedIds', { type: Array, required: true })
const scraps = defineModel('scraps', { type: Array, required: true })

const scrap = ref('')

const groups = computed(() => {
  const { useSoon, others } = groupPantryItems(props.items, props.today)
  return [
    { title: '⚠ Use soon', hint: 'Expiring within 48h', items: useSoon },
    { title: 'From your pantry', hint: `${others.length} items`, items: others },
  ].filter((group) => group.items.length)
})

const isSelected = (item) => selectedIds.value.includes(item.id)
const toggle = (item) => (selectedIds.value = toggleValue(selectedIds.value, item.id))

const detail = (item) =>
  isUseSoon(item, props.today)
    ? `Expires ${expirationLabel(item.expirationDate, props.today).toLowerCase()}`
    : item.category

function addScrap() {
  scraps.value = addIngredient(scraps.value, scrap.value)
  scrap.value = ''
}
</script>
