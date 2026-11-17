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
        <form novalidate class="grid grid-cols-2 gap-4" @submit.prevent="save">
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
                {{ option }}
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
      </section>
    </div>
  </Teleport>
</template>
<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { usePantryStore } from '@/stores/pantry'
import { PANTRY_UNITS, validateItem } from '@/utils/pantry'
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
let previousFocus, previousOverflow
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
