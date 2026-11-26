<!--
  US-09: shopping list, opened from the header.
  Side panel on desktop, full screen on mobile. Each item can be ticked by hand or
  scanned with the camera; checked items are moved to the pantry with MoveToPantryDialog.
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
        aria-labelledby="shopping-list-title"
        data-testid="shopping-list-screen"
        tabindex="-1"
        class="flex h-dvh w-full flex-col overflow-hidden bg-canvas font-sans text-ink shadow-2xl outline-none md:max-w-md"
        @keydown="onKeydown"
      >
        <ShoppingScanner
          v-if="scanningItem"
          :item-name="scanningItem.name"
          @found="productFound"
          @close="showScanner(null)"
        />
        <template v-else>
          <div
            class="flex items-start justify-between gap-3 px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-2"
          >
            <div>
              <p class="text-sm text-muted">Keep track of everything you need to buy.</p>
              <h2
                id="shopping-list-title"
                class="mt-1 text-[34px] leading-[1.05] font-semibold tracking-[-0.045em]"
              >
                Shopping list
              </h2>
            </div>
            <button
              type="button"
              aria-label="Close shopping list"
              data-testid="close-shopping-list-button"
              class="card pressable flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface text-xl leading-none"
              @click="$emit('close')"
            >
              ×
            </button>
          </div>

          <div class="relative flex-1 overflow-y-auto px-5 pt-3 pb-6">
            <form novalidate @submit.prevent="addItem">
              <label for="shopping-item-name" class="sr-only">Item name</label>
              <div
                class="card flex items-center gap-2 rounded-full bg-surface p-1.5 pl-4 ring-1"
                :class="addError ? 'ring-status-today' : 'ring-transparent'"
              >
                <input
                  id="shopping-item-name"
                  v-model="newItem"
                  data-testid="item-name-input"
                  autocomplete="off"
                  placeholder="e.g. Eggs"
                  class="min-w-0 flex-1 bg-transparent py-2 outline-none placeholder:text-muted"
                  :aria-invalid="Boolean(addError)"
                  @input="addError = ''"
                  :aria-describedby="addError ? 'shopping-add-error' : undefined"
                />
                <BaseButton type="submit" data-testid="add-button" class="!px-5 !py-2.5"
                  >Add</BaseButton
                >
              </div>
              <p
                v-if="addError"
                id="shopping-add-error"
                role="alert"
                class="mt-2 px-1 text-xs text-status-today"
              >
                {{ addError }}
              </p>
            </form>

            <div class="mt-6 mb-3 flex items-baseline justify-between px-1">
              <h3 class="text-[17px] font-semibold tracking-tight">
                To buy <span class="font-normal text-muted">({{ store.items.length }})</span>
              </h3>
              <span v-if="store.items.length" class="text-xs text-muted"
                >{{ store.checkedItems.length }} selected</span
              >
            </div>

            <div
              v-if="!store.items.length"
              data-testid="shopping-list-empty-state"
              class="flex flex-col items-center rounded-[26px] border border-dashed border-hairline px-6 py-10 text-center"
            >
              <span
                class="card flex h-14 w-14 items-center justify-center rounded-[20px] bg-surface"
              >
                <AppIcon name="cart" class="h-6 w-6" />
              </span>
              <p class="mt-4 text-sm font-semibold">Your shopping list is empty</p>
              <p class="mt-1 max-w-60 text-xs text-muted">
                Add an item above. When you buy it, scan it or tick it to move it to your pantry.
              </p>
            </div>

            <template v-else>
              <ul class="grid gap-2" aria-label="Items to buy">
                <li
                  v-for="item in store.items"
                  :key="item.id"
                  data-testid="shopping-list-item-row"
                  class="card flex items-center gap-3 rounded-[22px] bg-surface p-2 pr-2.5 ring-1 transition"
                  :class="item.checked ? 'ring-ink' : 'ring-transparent'"
                >
                  <input
                    :id="`shopping-item-${item.id}`"
                    type="checkbox"
                    data-testid="shopping-list-item-checkbox"
                    class="ml-2 h-5 w-5 shrink-0 cursor-pointer accent-ink"
                    :checked="item.checked"
                    @change="store.toggleItem(item.id)"
                  />
                  <FoodIcon :name="item.name" size="sm" rounded="rounded-[14px]" />
                  <label
                    :for="`shopping-item-${item.id}`"
                    class="min-w-0 flex-1 cursor-pointer"
                    :data-testid="`shopping-list-item-${item.name}`"
                  >
                    <span
                      class="block text-[15px] font-semibold break-words"
                      data-testid="shopping-list-item-name"
                      >{{ item.name }}</span
                    >
                    <span class="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
                      <template v-if="item.scanned">
                        <span
                          class="rounded-full bg-lime px-2 py-px text-[10.5px] font-medium text-lime-ink"
                          >Scanned</span
                        >{{ quantityLabel(item.scanned) }}
                      </template>
                      <template v-else>Manual</template>
                    </span>
                  </label>
                  <button
                    type="button"
                    data-testid="shopping-list-item-scan-button"
                    class="pressable flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                    :class="
                      item.scanned ? 'bg-ink text-white' : 'bg-tile text-ink hover:bg-hairline'
                    "
                    :aria-label="item.scanned ? `Scan ${item.name} again` : `Scan ${item.name}`"
                    @click="showScanner(item)"
                  >
                    <svg
                      v-if="item.scanned"
                      class="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2.6"
                      aria-hidden="true"
                    >
                      <path d="M5 12l5 5L20 7" />
                    </svg>
                    <svg
                      v-else
                      class="h-4.5 w-4.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.8"
                      aria-hidden="true"
                    >
                      <path d="M4 8h3l2-3h6l2 3h3v11H4z" stroke-linejoin="round" />
                      <circle cx="12" cy="13" r="3.5" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    data-testid="shopping-list-item-remove-button"
                    class="pressable flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm text-muted hover:bg-tile hover:text-ink"
                    :aria-label="`Remove ${item.name}`"
                    @click="store.removeItem(item.id)"
                  >
                    ✕
                  </button>
                </li>
              </ul>
              <p class="mt-3 px-1 text-xs text-muted">
                Tap the camera to scan a product as you buy it, or tick the box.
              </p>
            </template>

            <div
              v-if="scanToast"
              role="status"
              class="sticky bottom-0 mt-6 flex items-center gap-3 rounded-[22px] bg-ink p-3 pl-3.5 text-white shadow-[0_18px_40px_-16px_rgb(0_0_0/0.55)]"
            >
              <span
                class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-lime text-sm text-lime-ink"
                aria-hidden="true"
                >✓</span
              >
              <div class="min-w-0 flex-1">
                <p class="text-sm font-semibold" data-testid="shopping-list-scan-message">
                  {{ scanToast.name }} scanned
                </p>
                <p class="text-xs text-white/60">{{ scanToast.detail }}</p>
              </div>
              <button
                type="button"
                data-testid="shopping-list-undo-scan-button"
                class="pressable rounded-full bg-white/12 px-3.5 py-2 text-xs font-semibold hover:bg-white/20"
                @click="undoScan"
              >
                Undo
              </button>
            </div>
          </div>

          <div class="glass m-3 mb-[max(0.75rem,env(safe-area-inset-bottom))] rounded-[28px] p-2">
            <BaseButton
              class="w-full"
              data-testid="move-to-pantry-button"
              :disabled="!store.checkedItems.length"
              @click="transferOpen = true"
              >Move to pantry<template v-if="store.checkedItems.length">
                ({{ store.checkedItems.length }})</template
              ></BaseButton
            >
            <p class="px-2 pt-2 pb-1 text-center text-xs text-ink-soft">
              Only scanned or checked items will be moved. The rest stays on the list.
            </p>
          </div>
        </template>
        <p role="status" class="sr-only">{{ announcement }}</p>
      </section>
    </div>
    <MoveToPantryDialog
      v-if="transferOpen"
      :items="store.checkedItems"
      @close="closeTransfer"
      @moved="itemsMoved"
    />
  </Teleport>
</template>

<script setup>
import { defineAsyncComponent, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import FoodIcon from '@/components/ui/FoodIcon.vue'
import MoveToPantryDialog from '@/components/shopping/MoveToPantryDialog.vue'
// Loaded only when a camera button is tapped (the barcode library is large).
const ShoppingScanner = defineAsyncComponent(
  () => import('@/components/shopping/ShoppingScanner.vue'),
)
import { useShoppingListStore } from '@/stores/shoppingList'
import { trapDialogTab } from '@/utils/dialogFocus'
import { UNIT_LABELS } from '@/utils/pantry'

const emit = defineEmits(['close'])
const store = useShoppingListStore()
const panel = ref(null)
const newItem = ref('')
const addError = ref('')
const scanningItem = ref(null)
const scanToast = ref(null) // { id, name, detail }
const transferOpen = ref(false)
const announcement = ref('')
let toastTimer, previousFocus, previousOverflow

const quantityLabel = (scanned) =>
  scanned.quantity ? `${scanned.quantity} ${UNIT_LABELS[scanned.unit] ?? scanned.unit}` : ''

function addItem() {
  try {
    const item = store.addItem(newItem.value)
    newItem.value = ''
    addError.value = ''
    announcement.value = `${item.name} added to the shopping list.`
  } catch (error) {
    addError.value = error.message
  }
}

function showScanner(item) {
  scanningItem.value = item
  panel.value?.focus()
}

function productFound(product) {
  const item = scanningItem.value
  store.markScanned(item.id, product)
  const quantity = quantityLabel(item.scanned)
  scanToast.value = {
    id: item.id,
    name: item.name,
    detail: quantity
      ? `${quantity} filled in from the barcode`
      : 'Product details filled in from the barcode',
  }
  window.clearTimeout(toastTimer)
  toastTimer = window.setTimeout(() => (scanToast.value = null), 6000)
  showScanner(null)
}

function undoScan() {
  store.undoScan(scanToast.value.id)
  scanToast.value = null
}

async function closeTransfer() {
  transferOpen.value = false
  await nextTick()
  panel.value?.focus()
}

function itemsMoved(count) {
  scanToast.value = null
  announcement.value = `${count} ${count === 1 ? 'item' : 'items'} moved to your pantry.`
  closeTransfer()
}

function onKeydown(event) {
  if (event.key === 'Escape') {
    event.stopPropagation()
    if (scanningItem.value) showScanner(null)
    else emit('close')
  }
  trapDialogTab(event, panel.value)
}
onMounted(() => {
  previousFocus = document.activeElement
  previousOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
  panel.value.focus()
})
onBeforeUnmount(() => {
  window.clearTimeout(toastTimer)
  document.body.style.overflow = previousOverflow
  previousFocus?.focus()
})
</script>

<style scoped>
@reference "../../css/index.css";
.field {
  @apply h-12 w-full rounded-2xl bg-tile px-3.5 text-ink ring-1 ring-transparent outline-none focus:bg-surface focus:ring-2 focus:ring-ink;
}
.field.prefilled {
  @apply bg-lime/45;
}
.field[aria-invalid='true'] {
  @apply ring-status-today;
}
</style>
