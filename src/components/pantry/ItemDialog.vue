<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-6"
      @click.self="$emit('close')"
    >
      <section
        ref="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="item-dialog-title"
        data-testid="item-dialog"
        tabindex="-1"
        class="max-h-[95dvh] w-full overflow-y-auto rounded-t-2xl bg-white p-6 shadow-xl sm:max-w-lg sm:rounded-2xl"
        @keydown="onKeydown"
      >
        <BarcodeScanner
          v-if="view === 'scanner'"
          @found="fillFromBarcode"
          @manual="backToForm"
          @close="backToForm"
        />
        <template v-else>
          <div class="mb-5 flex items-center justify-between">
            <h2 id="item-dialog-title" class="text-xl font-bold">
              {{ item ? 'Edit item' : 'Add item' }}
            </h2>
            <button
              type="button"
              aria-label="Close item form"
              data-testid="close-item-dialog-button"
              class="rounded p-2 text-xl hover:bg-neutral-100"
              @click="$emit('close')"
            >
              ×
            </button>
          </div>
          <template v-if="!item">
            <button
              type="button"
              data-testid="scan-barcode-button"
              class="flex w-full items-center gap-3 rounded-xl border border-neutral-800 p-3 text-left hover:bg-neutral-50"
              @click="view = 'scanner'"
            >
              <span
                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-800 text-sm text-white"
                aria-hidden="true"
                >▥</span
              >
              <span class="min-w-0 flex-1">
                <span class="block text-sm font-semibold">Scan barcode</span>
                <span class="block text-xs text-neutral-500"
                  >Auto-fill item details using your camera</span
                >
              </span>
              <span class="text-neutral-400" aria-hidden="true">›</span>
            </button>
            <p
              class="my-4 flex items-center gap-3 text-[11px] uppercase tracking-wide text-neutral-400 before:h-px before:flex-1 before:bg-neutral-200 after:h-px after:flex-1 after:bg-neutral-200"
            >
              or enter item details
            </p>
            <p
              v-if="autoFilled"
              data-testid="barcode-autofill-badge"
              class="mb-3 inline-block rounded-full border border-neutral-300 px-2.5 py-1 text-xs text-neutral-600"
            >
              ✓ Details auto-filled from barcode
            </p>
          </template>
          <form
            novalidate
            data-testid="pantry-item-form"
            class="grid grid-cols-2 gap-4"
            @submit.prevent="save"
          >
            <div
              v-for="field in fields"
              :key="field.key"
              :class="['quantity', 'unit'].includes(field.key) ? 'min-w-0' : 'col-span-2'"
            >
              <label :for="`item-${field.key}`" class="mb-1 block text-sm font-semibold">{{
                field.label
              }}</label>
              <select
                v-if="field.options"
                :id="`item-${field.key}`"
                :data-testid="field.testId"
                v-model="draft[field.key]"
                class="field"
                :aria-invalid="Boolean(errors[field.key])"
                :aria-describedby="errors[field.key] ? `error-${field.key}` : undefined"
                @change="field.key === 'category' && categoryChanged()"
              >
                <option value="" disabled>
                  {{ field.key === 'category' ? 'Select a category' : 'Select' }}
                </option>
                <option v-for="option in field.options" :key="option" :value="option">
                  {{ UNIT_LABELS[option] ?? option }}
                </option>
                <option v-if="field.key === 'category'" :value="CREATE_CATEGORY">
                  + Create new category
                </option>
              </select>
              <input
                v-else
                :id="`item-${field.key}`"
                :data-testid="field.testId"
                v-model="draft[field.key]"
                :type="field.type || 'text'"
                :step="field.key === 'quantity' ? 'any' : undefined"
                :min="field.key === 'quantity' ? 0 : undefined"
                :placeholder="field.placeholder"
                class="field"
                :aria-invalid="Boolean(errors[field.key])"
                :aria-describedby="errors[field.key] ? `error-${field.key}` : undefined"
              />
              <p
                v-if="errors[field.key]"
                :id="`error-${field.key}`"
                class="mt-1 text-xs text-red-700"
              >
                {{ errors[field.key] }}
              </p>
              <div
                v-if="field.key === 'category' && creatingCategory"
                class="mt-3 rounded-lg border border-neutral-300 p-3"
              >
                <label for="new-category" class="mb-2 block text-sm font-semibold"
                  >Create new category</label
                >
                <div class="flex gap-2">
                  <input
                    id="new-category"
                    data-testid="new-category-input"
                    v-model="newCategory"
                    class="field min-w-0 flex-1"
                    placeholder="e.g. Sauces"
                    :aria-invalid="Boolean(categoryError)"
                    @keydown.enter.prevent="addCategory"
                  /><BaseButton data-testid="add-category-button" @click="addCategory"
                    >Add</BaseButton
                  >
                </div>
                <p v-if="categoryError" role="alert" class="mt-1 text-xs text-red-700">
                  {{ categoryError }}
                </p>
                <p class="mt-2 text-xs text-neutral-500">
                  New categories are saved for future items.
                </p>
              </div>
            </div>
            <p v-if="saveError" role="alert" class="col-span-2 text-sm text-red-700">
              {{ saveError }}
            </p>
            <div class="col-span-2 flex gap-3 pt-3">
              <BaseButton
                variant="secondary"
                class="flex-1"
                data-testid="cancel-button"
                @click="$emit('close')"
                >Cancel</BaseButton
              ><BaseButton
                type="submit"
                class="flex-[2]"
                :data-testid="item ? 'save-changes-button' : 'save-item-button'"
                >{{ item ? 'Save changes' : 'Save item' }}</BaseButton
              >
            </div>
          </form>
        </template>
      </section>
    </div>
  </Teleport>
</template>
<script setup>
import {
  computed,
  defineAsyncComponent,
  nextTick,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
} from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
// Loaded only when "Scan barcode" is opened (the barcode library is large).
const BarcodeScanner = defineAsyncComponent(() => import('@/components/pantry/BarcodeScanner.vue'))
import { usePantryStore } from '@/stores/pantry'
import { PANTRY_UNITS, UNIT_LABELS, validateItem } from '@/utils/pantry'
const props = defineProps({ item: { type: Object, default: null } })
const emit = defineEmits(['close', 'saved'])
const store = usePantryStore()
const CREATE_CATEGORY = '__smartpantry_create_category__'
const draft = reactive({
  name: '',
  category: '',
  quantity: '',
  unit: '',
  expirationDate: '',
  ...props.item,
})
const fields = computed(() => [
  { key: 'name', label: 'Item name', testId: 'item-name-input', placeholder: 'e.g. Pesto sauce' },
  { key: 'category', label: 'Category', testId: 'category-select', options: store.categories },
  {
    key: 'quantity',
    label: 'Quantity',
    testId: 'quantity-input',
    type: 'number',
    placeholder: '0',
  },
  { key: 'unit', label: 'Unit', testId: 'unit-select', options: PANTRY_UNITS },
  {
    key: 'expirationDate',
    label: 'Expiration date',
    testId: 'expiration-date-input',
    type: 'date',
  },
])
const errors = ref({})
const dialog = ref(null)
const creatingCategory = ref(false)
const newCategory = ref('')
const categoryError = ref('')
const saveError = ref('')
const view = ref('form') // 'form' | 'scanner'
const autoFilled = ref(false)
let previousFocus, previousOverflow

// US-08: fill the form with the product found by barcode; the user can still change everything.
async function fillFromBarcode(product) {
  draft.name = product.name
  if (product.quantity) draft.quantity = product.quantity
  if (product.unit) draft.unit = product.unit
  autoFilled.value = true
  errors.value = {}
  await backToForm()
}
async function backToForm() {
  view.value = 'form'
  await nextTick()
  dialog.value.querySelector('#item-name')?.focus()
}
async function categoryChanged() {
  creatingCategory.value = draft.category === CREATE_CATEGORY
  if (creatingCategory.value) {
    draft.category = ''
    await nextTick()
    dialog.value.querySelector('#new-category')?.focus()
  }
}
function addCategory() {
  try {
    draft.category = store.addCategory(newCategory.value)
    creatingCategory.value = false
    categoryError.value = ''
    errors.value.category = ''
  } catch (error) {
    categoryError.value = error.message
  }
}
async function save() {
  errors.value = validateItem(draft, store.categories)
  if (Object.keys(errors.value).length) {
    await nextTick()
    dialog.value.querySelector('[aria-invalid="true"]')?.focus()
    return
  }
  try {
    emit('saved', store.saveItem(draft, props.item?.id))
  } catch (error) {
    saveError.value = error.message
  }
}
function onKeydown(event) {
  if (event.key === 'Escape') {
    event.stopPropagation()
    emit('close')
  }
  if (event.key !== 'Tab') return
  const controls = [...dialog.value.querySelectorAll('button, input, select')].filter(
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
  dialog.value.querySelector('#item-name')?.focus()
})
onBeforeUnmount(() => {
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
