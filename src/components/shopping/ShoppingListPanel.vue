<!--
  US-09: shopping list, opened from the header.
  Side panel on desktop, full screen on mobile. Each item can be ticked by hand or
  scanned with the camera; checked items are moved to the pantry with MoveToPantryDialog.
-->
<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex justify-end bg-black/30" @click.self="$emit('close')">
      <section
        ref="panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="shopping-list-title"
        data-testid="shopping-list-screen"
        tabindex="-1"
        class="flex h-dvh w-full flex-col bg-white shadow-xl md:max-w-sm"
        @keydown="onKeydown"
      >
        <ShoppingScanner
          v-if="scanningItem"
          :item-name="scanningItem.name"
          @found="productFound"
          @close="closeScanner"
        />
        <template v-else>
          <div class="flex items-start justify-between gap-3 border-b border-neutral-200 p-5">
            <div>
              <h2 id="shopping-list-title" class="text-xl font-bold">Shopping list</h2>
              <p class="mt-1 text-xs text-neutral-500">Keep track of everything you need to buy.</p>
            </div>
            <button
              type="button"
              aria-label="Close shopping list"
              data-testid="close-shopping-list-button"
              class="rounded p-2 text-xl hover:bg-neutral-100"
              @click="$emit('close')"
            >
              ×
            </button>
          </div>

          <div class="relative flex-1 overflow-y-auto p-5">
            <form novalidate @submit.prevent="addItem">
              <label for="shopping-item-name" class="mb-1 block text-sm font-semibold"
                >Item name</label
              >
              <div class="flex gap-2">
                <input
                  id="shopping-item-name"
                  ref="nameInput"
                  v-model="newItem"
                  data-testid="item-name-input"
                  autocomplete="off"
                  placeholder="e.g. Eggs"
                  class="field min-w-0 flex-1"
                  :aria-invalid="Boolean(addError)"
                  @input="addError = ''"
                  :aria-describedby="addError ? 'shopping-add-error' : undefined"
                />
                <BaseButton type="submit" data-testid="add-button">Add</BaseButton>
              </div>
              <p
                v-if="addError"
                id="shopping-add-error"
                role="alert"
                class="mt-1 text-xs text-red-700"
              >
                {{ addError }}
              </p>
            </form>

            <div
              class="mt-5 flex justify-between border-b border-neutral-200 pb-2 text-sm font-semibold"
            >
              <h3>
                To buy <span class="font-normal text-neutral-500">({{ store.items.length }})</span>
              </h3>
              <span v-if="store.items.length" class="text-xs font-normal text-neutral-500"
                >{{ store.checkedItems.length }} selected</span
              >
            </div>

            <div
              v-if="!store.items.length"
              data-testid="shopping-list-empty-state"
              class="flex flex-col items-center py-10 text-center"
            >
              <svg
                class="h-8 w-8 text-neutral-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.6"
                aria-hidden="true"
              >
                <path
                  d="M3 4h2l2.4 11h11.2L21 7H6.2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <circle cx="9" cy="19.5" r="1.3" />
                <circle cx="17" cy="19.5" r="1.3" />
              </svg>
              <p class="mt-3 text-sm font-semibold">Your shopping list is empty</p>
              <p class="mt-1 max-w-60 text-xs text-neutral-500">
                Add an item above. When you buy it, scan it or tick it to move it to your pantry.
              </p>
            </div>

            <template v-else>
              <ul aria-label="Items to buy">
                <li
                  v-for="item in store.items"
                  :key="item.id"
                  data-testid="shopping-list-item-row"
                  class="flex items-center gap-3 border-b border-neutral-100 py-3"
                >
                  <input
                    :id="`shopping-item-${item.id}`"
                    type="checkbox"
                    data-testid="shopping-list-item-checkbox"
                    class="h-4 w-4 shrink-0 accent-neutral-800"
                    :checked="item.checked"
                    @change="store.toggleItem(item.id)"
                  />
                  <label
                    :for="`shopping-item-${item.id}`"
                    class="min-w-0 flex-1 cursor-pointer"
                    :data-testid="`shopping-list-item-${item.name}`"
                  >
                    <span
                      class="block break-words text-sm font-semibold"
                      data-testid="shopping-list-item-name"
                      >{{ item.name }}</span
                    >
                    <span class="mt-0.5 flex items-center gap-1.5 text-xs text-neutral-500">
                      <template v-if="item.scanned">
                        <span class="rounded-full border border-neutral-400 px-1.5 text-[10px]"
                          >Scanned</span
                        >{{ quantityLabel(item.scanned) }}
                      </template>
                      <template v-else>Manual</template>
                    </span>
                  </label>
                  <button
                    type="button"
                    data-testid="shopping-list-item-scan-button"
                    class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border"
                    :class="
                      item.scanned
                        ? 'border-neutral-800 bg-neutral-800 text-white'
                        : 'border-neutral-400 text-neutral-700 hover:border-neutral-800'
                    "
                    :aria-label="item.scanned ? `Scan ${item.name} again` : `Scan ${item.name}`"
                    @click="scanningItem = item"
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
                      class="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      aria-hidden="true"
                    >
                      <path d="M4 8h3l2-3h6l2 3h3v11H4z" stroke-linejoin="round" />
                      <circle cx="12" cy="13" r="3.5" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    data-testid="shopping-list-item-remove-button"
                    class="rounded p-1 text-neutral-400 hover:text-neutral-800"
                    :aria-label="`Remove ${item.name}`"
                    @click="store.removeItem(item.id)"
                  >
                    ✕
                  </button>
                </li>
              </ul>
              <p class="mt-3 text-xs text-neutral-500">
                Tap the camera to scan a product as you buy it, or tick the box.
              </p>
            </template>

            <div
              v-if="scanToast"
              role="status"
              class="sticky bottom-0 mt-6 flex items-center gap-3 rounded-xl bg-neutral-800 p-3 text-white shadow-lg"
            >
              <span
                class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-neutral-800"
                aria-hidden="true"
                >✓</span
              >
              <div class="min-w-0 flex-1">
                <p class="text-sm font-semibold" data-testid="shopping-list-scan-message">
                  {{ scanToast.name }} scanned
                </p>
                <p class="text-xs text-neutral-300">{{ scanToast.detail }}</p>
              </div>
              <button
                type="button"
                data-testid="shopping-list-undo-scan-button"
                class="text-xs font-semibold underline"
                @click="undoScan"
              >
                Undo
              </button>
            </div>
          </div>

          <div class="border-t border-neutral-200 p-5">
            <BaseButton
              class="w-full"
              data-testid="move-to-pantry-button"
              :disabled="!store.checkedItems.length"
              @click="transferOpen = true"
              >Move to pantry<template v-if="store.checkedItems.length">
                ({{ store.checkedItems.length }})</template
              ></BaseButton
            >
            <p class="mt-2 text-center text-xs text-neutral-500">
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
import MoveToPantryDialog from '@/components/shopping/MoveToPantryDialog.vue'
// Loaded only when a camera button is tapped (the barcode library is large).
const ShoppingScanner = defineAsyncComponent(
  () => import('@/components/shopping/ShoppingScanner.vue'),
)
import { useShoppingListStore } from '@/stores/shoppingList'
import { UNIT_LABELS } from '@/utils/pantry'

const emit = defineEmits(['close'])
const store = useShoppingListStore()
const panel = ref(null)
const nameInput = ref(null)
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
  nameInput.value?.focus()
}

async function closeScanner() {
  scanningItem.value = null
  await nextTick()
  nameInput.value?.focus()
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
  closeScanner()
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
    if (scanningItem.value) closeScanner()
    else emit('close')
  }
  if (event.key !== 'Tab') return
  const controls = [...panel.value.querySelectorAll('button, input, select')].filter(
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
  nameInput.value?.focus()
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
  @apply w-full rounded-lg border border-neutral-300 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-900 outline-none focus:border-neutral-800 focus:ring-1 focus:ring-neutral-800;
}
.field[aria-invalid='true'] {
  @apply border-red-600;
}
</style>
