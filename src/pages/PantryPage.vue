<template>
  <DashboardLayout>
    <div class="flex items-center justify-between gap-3">
      <h1 data-testid="pantry-title" class="text-xl font-bold md:text-2xl">My Pantry</h1>
      <BaseButton v-if="store.items.length" data-testid="add-item-button" @click="openItem()"
        >+ Add item</BaseButton
      >
    </div>
    <p role="status" class="sr-only">{{ announcement }}</p>
    <section
      v-if="!store.items.length"
      class="flex min-h-[60vh] flex-col items-center justify-center text-center"
      data-testid="pantry-empty"
    >
      <ImagePlaceholder label="Empty pantry illustration" size="lg" />
      <h2 class="mt-5 text-lg font-bold">Your pantry is empty</h2>
      <p class="mt-2 max-w-xs text-sm text-neutral-500">
        Add your first item to start tracking quantities and expiration dates.
      </p>
      <BaseButton class="mt-6" data-testid="add-item-button" @click="openItem()"
        >+ Add item</BaseButton
      >
    </section>
    <template v-else>
      <section
        v-for="tray in alertTrays"
        :key="tray.title"
        class="mt-5 rounded-xl border border-neutral-700 bg-neutral-50 p-4"
        :aria-label="tray.title"
        :data-testid="tray.testId"
      >
        <div class="flex justify-between gap-3 text-sm font-semibold">
          <h2>ⓘ {{ tray.title }}</h2>
          <span>{{ tray.items.length }}</span>
        </div>
        <div class="mt-3 flex gap-3 overflow-x-auto pb-1">
          <button
            v-for="item in tray.items"
            :key="item.id"
            type="button"
            class="min-w-40 rounded-lg border border-neutral-300 bg-white p-3 text-left hover:border-neutral-800"
            :aria-label="`Edit ${item.name}`"
            :data-testid="`${tray.testId}-item-${item.name}`"
            @click="openItem(item)"
          >
            <span class="block text-sm font-semibold">{{ item.name }}</span
            ><span class="mt-1 block text-xs text-neutral-500">{{
              days(item) < 0 ? label(item) : `Expires ${label(item).toLowerCase()}`
            }}</span>
          </button>
        </div>
      </section>
      <div
        class="my-5 flex gap-2 overflow-x-auto pb-1"
        role="group"
        aria-label="Filter by category"
      >
        <button
          v-for="category in ['All', ...store.categories]"
          :key="category"
          type="button"
          :aria-pressed="selectedCategory === category"
          class="shrink-0 rounded-full border px-3 py-1.5 text-xs"
          :class="
            selectedCategory === category
              ? 'border-neutral-800 bg-neutral-800 font-semibold text-white'
              : 'border-neutral-300 bg-white text-neutral-600 hover:border-neutral-800'
          "
          @click="selectedCategory = category"
        >
          {{ category }}
        </button>
      </div>
      <div v-if="filteredItems.length">
        <div
          class="mb-2 hidden grid-cols-[2fr_1fr_1fr_1fr_1rem] gap-4 px-3 text-xs font-semibold text-neutral-500 md:grid"
          aria-hidden="true"
        >
          <span>Item</span><span>Category</span><span>Quantity</span><span>Expires</span><span />
        </div>
        <ul class="space-y-2" aria-label="Pantry items">
          <li v-for="item in filteredItems" :key="item.id" data-testid="pantry-item-card">
            <button
              type="button"
              class="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-xl border bg-white p-3 text-left hover:bg-neutral-50 md:grid-cols-[2fr_1fr_1fr_1fr_1rem] md:gap-4"
              :class="days(item) <= 1 ? 'border-neutral-700' : 'border-neutral-300'"
              :aria-label="`Edit ${item.name}, ${item.quantity} ${item.unit}, ${label(item)}`"
              :data-testid="`pantry-item-${item.name}`"
              :data-highlighted="days(item) <= 1"
              @click="openItem(item)"
            >
              <span class="flex min-w-0 items-center gap-3 text-sm font-semibold"
                ><ImagePlaceholder :label="item.name" class="hidden md:block" /><span
                  class="break-words"
                  data-testid="pantry-item-name"
                  >{{ item.name }}</span
                ></span
              >
              <span class="hidden truncate text-sm text-neutral-500 md:block">{{
                item.category
              }}</span>
              <span
                class="col-start-1 row-start-2 text-xs text-neutral-500 md:col-auto md:row-auto md:text-sm"
                ><span :data-testid="`pantry-item-quantity-${item.name}`">{{ item.quantity }}</span>
                {{ item.unit === 'units' && item.quantity === 1 ? 'unit' : item.unit }}</span
              >
              <span
                class="col-start-2 row-span-2 row-start-1 max-w-28 text-right text-xs md:col-auto md:row-auto md:max-w-none md:text-left md:text-sm"
                :class="days(item) <= 1 ? 'font-semibold' : 'text-neutral-500'"
                >{{ label(item) }}</span
              ><span class="hidden text-neutral-400 md:block" aria-hidden="true">›</span>
            </button>
          </li>
        </ul>
      </div>
      <p
        v-else
        class="rounded-xl border border-dashed border-neutral-300 p-10 text-center text-sm text-neutral-500"
      >
        No items in {{ selectedCategory }} yet.
      </p>
    </template>
    <ItemDialog
      v-if="dialogOpen"
      :item="editingItem"
      @close="dialogOpen = false"
      @saved="itemSaved"
    />
  </DashboardLayout>
</template>
<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import ImagePlaceholder from '@/components/ui/ImagePlaceholder.vue'
import ItemDialog from '@/components/pantry/ItemDialog.vue'
import { usePantryStore } from '@/stores/pantry'
import { daysUntilExpiration, expirationLabel } from '@/utils/pantry'
const store = usePantryStore()
const selectedCategory = ref('All'),
  dialogOpen = ref(false),
  editingItem = ref(null),
  announcement = ref(''),
  today = ref(new Date())
const days = (item) => daysUntilExpiration(item.expirationDate, today.value)
const label = (item) => expirationLabel(item.expirationDate, today.value)
const filteredItems = computed(() =>
  store.items.filter(
    (item) => selectedCategory.value === 'All' || item.category === selectedCategory.value,
  ),
)
const alertTrays = computed(() =>
  [
    {
      title: 'Expired items',
      testId: 'expired-tray',
      items: store.items.filter((item) => days(item) < 0),
    },
    {
      title: 'Expiring within 48 hours',
      testId: 'expiring-tray',
      items: store.items.filter((item) => days(item) >= 0 && days(item) <= 1),
    },
  ].filter((tray) => tray.items.length),
)
function openItem(item = null) {
  editingItem.value = item
  dialogOpen.value = true
}
function itemSaved(item) {
  announcement.value = `${item.name} ${editingItem.value ? 'updated' : 'added to pantry'}.`
  selectedCategory.value = 'All'
  dialogOpen.value = false
}
let timer
function refreshDate() {
  today.value = new Date()
}
onMounted(() => {
  timer = window.setInterval(refreshDate, 60000)
  window.addEventListener('focus', refreshDate)
})
onBeforeUnmount(() => {
  window.clearInterval(timer)
  window.removeEventListener('focus', refreshDate)
})
</script>
