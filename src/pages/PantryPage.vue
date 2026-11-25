<template>
  <DashboardLayout>
    <div class="mt-4 md:mt-2">
      <p v-if="store.items.length" class="text-sm text-muted">
        {{ store.items.length }} {{ store.items.length === 1 ? 'item' : 'items' }} in stock
      </p>
      <div class="mt-1 flex flex-wrap items-end justify-between gap-4">
        <h1
          data-testid="pantry-title"
          class="text-[40px] leading-[1.02] font-semibold tracking-[-0.045em] md:text-5xl"
        >
          My <em class="font-medium text-ink-soft">Pantry</em>
        </h1>
        <BaseButton v-if="store.items.length" data-testid="add-item-button" @click="openItem()"
          >+ Add item</BaseButton
        >
      </div>
    </div>
    <p role="status" class="sr-only">{{ announcement }}</p>
    <section
      v-if="!store.items.length"
      class="flex min-h-[60vh] flex-col items-center justify-center text-center"
      data-testid="pantry-empty"
    >
      <span
        class="card flex h-20 w-20 items-center justify-center rounded-[28px] bg-surface text-ink"
      >
        <AppIcon name="pantry" class="h-9 w-9" stroke-width="1.5" />
      </span>
      <h2 class="mt-6 text-2xl font-semibold tracking-tight">Your pantry is empty</h2>
      <p class="mt-2 max-w-xs text-sm text-muted">
        Add your first item to start tracking quantities and expiration dates.
      </p>
      <BaseButton class="mt-7" data-testid="add-item-button" @click="openItem()"
        >+ Add item</BaseButton
      >
    </section>
    <template v-else>
      <section
        v-for="tray in alertTrays"
        :key="tray.title"
        class="mt-5 rounded-[30px] p-4"
        :class="tray.testId === 'expiring-tray' ? 'bg-lime text-lime-ink' : 'card bg-surface'"
        :aria-label="tray.title"
        :data-testid="tray.testId"
      >
        <div class="flex items-center justify-between gap-3">
          <h2 class="flex items-center gap-2.5 text-[17px] font-semibold tracking-tight">
            <span
              class="flex h-9 w-9 items-center justify-center rounded-full"
              :class="
                tray.testId === 'expiring-tray'
                  ? 'bg-white/55'
                  : 'bg-status-today/10 text-status-today'
              "
            >
              <AppIcon
                :name="tray.testId === 'expiring-tray' ? 'clock' : 'alert'"
                class="h-4.5 w-4.5"
              />
            </span>
            {{ tray.title }}
          </h2>
          <span
            class="rounded-full px-3 py-1 text-[13px] font-semibold"
            :class="tray.testId === 'expiring-tray' ? 'bg-white/55' : 'bg-tile'"
            >{{ tray.items.length }}</span
          >
        </div>
        <div class="-mr-4 mt-3 flex gap-2 overflow-x-auto pr-4 pb-1 [scrollbar-width:none]">
          <button
            v-for="item in tray.items"
            :key="item.id"
            type="button"
            class="pressable flex shrink-0 items-center gap-2.5 rounded-[18px] py-1.5 pr-4 pl-1.5 text-left"
            :class="
              tray.testId === 'expiring-tray'
                ? 'bg-white/70 hover:bg-white'
                : 'bg-tile hover:bg-hairline'
            "
            :aria-label="`Edit ${item.name}`"
            :data-testid="`${tray.testId}-item-${item.name}`"
            @click="openItem(item)"
          >
            <FoodIcon
              :name="item.name"
              :category="item.category"
              size="sm"
              rounded="rounded-xl"
              class="!bg-white"
            /><span
              ><span class="block text-[13.5px] font-semibold text-ink">{{ item.name }}</span
              ><span
                class="mt-0.5 block text-xs"
                :class="tray.testId === 'expiring-tray' ? 'text-lime-ink/75' : 'text-status-today'"
                >{{ days(item) < 0 ? label(item) : `Expires ${label(item).toLowerCase()}` }}</span
              ></span
            >
          </button>
        </div>
      </section>
      <div
        class="-mr-5 my-5 flex gap-2 overflow-x-auto pr-5 pb-1 [scrollbar-width:none]"
        role="group"
        aria-label="Filter by category"
      >
        <button
          v-for="category in ['All', ...store.categories]"
          :key="category"
          type="button"
          :aria-pressed="selectedCategory === category"
          class="pressable h-10 shrink-0 rounded-full px-4 text-sm"
          :class="
            selectedCategory === category
              ? 'bg-ink font-medium text-white'
              : 'card bg-surface text-ink-soft hover:text-ink'
          "
          @click="selectedCategory = category"
        >
          {{ category }}
        </button>
      </div>
      <ul v-if="filteredItems.length" class="grid gap-2.5 md:grid-cols-2" aria-label="Pantry items">
        <li v-for="item in filteredItems" :key="item.id" data-testid="pantry-item-card">
          <button
            type="button"
            class="card pressable flex w-full items-center gap-3.5 rounded-[26px] bg-surface p-2 pr-4 text-left"
            :aria-label="`Edit ${item.name}, ${item.quantity} ${item.unit}, ${label(item)}`"
            :data-testid="`pantry-item-${item.name}`"
            :data-highlighted="days(item) <= 1"
            @click="openItem(item)"
          >
            <FoodIcon :name="item.name" :category="item.category" rounded="rounded-[20px]" /><span
              class="min-w-0 flex-1"
              ><span
                class="block truncate text-base font-semibold tracking-tight"
                data-testid="pantry-item-name"
                >{{ item.name }}</span
              ><span class="mt-0.5 block truncate text-[13px] text-muted"
                ><span>{{ item.category }}</span
                ><span class="before:mx-1.5 before:content-['·']"
                  ><span :data-testid="`pantry-item-quantity-${item.name}`">{{
                    item.quantity
                  }}</span>
                  {{ item.unit === 'units' && item.quantity === 1 ? 'unit' : item.unit }}</span
                ></span
              ></span
            ><span
              class="flex shrink-0 items-center gap-1.5 text-[13px] font-medium text-ink-soft before:h-1.5 before:w-1.5 before:rounded-full before:content-['']"
              :class="statusDot(item)"
              >{{ label(item) }}</span
            ><span class="text-muted" aria-hidden="true">›</span>
          </button>
        </li>
      </ul>
      <p
        v-else
        class="rounded-[26px] border border-dashed border-hairline p-10 text-center text-sm text-muted"
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
import AppIcon from '@/components/ui/AppIcon.vue'
import FoodIcon from '@/components/ui/FoodIcon.vue'
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
// Status dot next to the expiration label: red today or expired, amber tomorrow, green later.
const statusDot = (item) => {
  const left = days(item)
  if (left <= 0) return 'before:bg-status-today'
  if (left === 1) return 'before:bg-status-soon'
  return 'before:bg-status-ok'
}
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
