<!--
  US-09: details of every checked shopping list item before it goes into the pantry.
  Scanned items already come with the quantity and unit read from the barcode.
  Emits: close, moved(count)
-->
<template>
  <div
    class="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 backdrop-blur-[2px] sm:items-center sm:p-6"
    @click.self="$emit('close')"
  >
    <section
      ref="dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="move-to-pantry-title"
      data-testid="shopping-list-transfer-dialog"
      tabindex="-1"
      class="flex max-h-[94dvh] w-full flex-col overflow-y-auto rounded-t-[32px] bg-canvas px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] font-sans text-ink shadow-2xl outline-none sm:max-w-xl sm:rounded-[32px] sm:p-7"
      @keydown="onKeydown"
    >
      <span class="mx-auto mb-4 h-1.5 w-10 rounded-full bg-ink/15 sm:hidden" aria-hidden="true" />
      <div class="flex items-start justify-between gap-3">
        <div>
          <h2
            id="move-to-pantry-title"
            class="text-[28px] leading-[1.05] font-semibold tracking-[-0.04em]"
          >
            Move to pantry
          </h2>
          <p class="mt-1.5 text-sm text-muted">
            Fill in the details of each item before saving it.
          </p>
        </div>
        <button
          type="button"
          aria-label="Close move to pantry"
          data-testid="close-transfer-dialog-button"
          class="card pressable flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface text-xl leading-none"
          @click="$emit('close')"
        >
          ×
        </button>
      </div>
      <p class="my-5 rounded-[20px] bg-tile p-3.5 text-xs leading-relaxed text-ink-soft">
        {{ drafts.length }} {{ drafts.length === 1 ? 'item' : 'items' }} will be added to your
        pantry.
        <template v-if="drafts.some((draft) => draft.scanned)"
          >Scanned items already come with the product details.</template
        >
        Items left unchecked stay on the shopping list.
      </p>

      <form novalidate @submit.prevent="confirm">
        <fieldset
          v-for="(draft, index) in drafts"
          :key="draft.id"
          data-testid="shopping-list-transfer-item"
          :data-item-name="draft.name"
          class="card mb-3 rounded-[26px] bg-surface p-4"
        >
          <legend class="sr-only">{{ draft.name }}</legend>
          <div class="mb-4 flex items-center gap-3" aria-hidden="true">
            <FoodIcon
              :name="draft.name"
              :category="draft.category"
              size="sm"
              rounded="rounded-[14px]"
            />
            <span
              class="text-[15px] font-semibold tracking-tight"
              data-testid="shopping-list-transfer-item-name"
              >{{ draft.name }}</span
            >
            <span
              class="ml-auto rounded-full px-2.5 py-1 text-[11px] font-medium"
              :class="draft.scanned ? 'bg-lime text-lime-ink' : 'bg-tile text-muted'"
              >{{ draft.scanned ? 'From barcode' : 'Manual' }}</span
            >
          </div>
          <div class="grid grid-cols-2 gap-3 sm:grid-cols-[1.4fr_0.8fr_0.9fr_1.3fr]">
            <div v-for="field in FIELDS" :key="field.key" class="min-w-0">
              <label
                :for="`transfer-${index}-${field.key}`"
                class="mb-1.5 block px-1 text-xs font-medium text-muted"
                >{{ field.label }}</label
              >
              <select
                v-if="field.key === 'category' || field.key === 'unit'"
                :id="`transfer-${index}-${field.key}`"
                v-model="draft[field.key]"
                :data-testid="field.testId"
                class="field"
                :class="{ prefilled: draft.prefilled.includes(field.key) }"
                :aria-invalid="Boolean(errors[draft.id]?.[field.key])"
                :aria-describedby="
                  errors[draft.id]?.[field.key] ? `transfer-${index}-${field.key}-error` : undefined
                "
                @change="field.key === 'category' && categoryChanged(draft)"
              >
                <option value="" disabled>Select</option>
                <option
                  v-for="option in field.key === 'category' ? pantry.categories : PANTRY_UNITS"
                  :key="option"
                  :value="option"
                >
                  {{ UNIT_LABELS[option] ?? option }}
                </option>
                <option v-if="field.key === 'category'" :value="CREATE_CATEGORY">
                  + Create new category
                </option>
              </select>
              <input
                v-else
                :id="`transfer-${index}-${field.key}`"
                v-model="draft[field.key]"
                :data-testid="field.testId"
                :type="field.type"
                :step="field.key === 'quantity' ? 'any' : undefined"
                :min="field.key === 'quantity' ? 0 : undefined"
                :placeholder="field.key === 'quantity' ? '0' : undefined"
                class="field"
                :class="{ prefilled: draft.prefilled.includes(field.key) }"
                :aria-invalid="Boolean(errors[draft.id]?.[field.key])"
                :aria-describedby="
                  errors[draft.id]?.[field.key] ? `transfer-${index}-${field.key}-error` : undefined
                "
              />
              <p
                v-if="errors[draft.id]?.[field.key]"
                :id="`transfer-${index}-${field.key}-error`"
                class="mt-1 px-1 text-xs text-status-today"
              >
                {{ errors[draft.id][field.key] }}
              </p>
            </div>
          </div>
          <!-- Same as the "Add item" form (US-02) -->
          <div v-if="draft.creatingCategory" class="mt-4 rounded-[20px] bg-tile p-3.5">
            <label
              :for="`transfer-${index}-new-category`"
              class="mb-2 block px-1 text-sm font-medium"
              >Create new category</label
            >
            <div class="flex gap-2">
              <input
                :id="`transfer-${index}-new-category`"
                v-model="draft.newCategory"
                data-testid="new-category-input"
                class="field min-w-0 flex-1 !bg-surface"
                placeholder="e.g. Sauces"
                :aria-invalid="Boolean(draft.categoryError)"
                @keydown.enter.prevent="addCategory(draft)"
              /><BaseButton data-testid="add-category-button" @click="addCategory(draft)"
                >Add</BaseButton
              >
            </div>
            <p
              v-if="draft.categoryError"
              role="alert"
              class="mt-1.5 px-1 text-xs text-status-today"
            >
              {{ draft.categoryError }}
            </p>
            <p class="mt-2 px-1 text-xs text-muted">New categories are saved for future items.</p>
          </div>
        </fieldset>
        <p v-if="saveError" role="alert" class="px-1 text-sm text-status-today">{{ saveError }}</p>
        <div class="flex gap-3 pt-3">
          <BaseButton
            variant="secondary"
            class="flex-1"
            data-testid="cancel-button"
            @click="$emit('close')"
            >Cancel</BaseButton
          ><BaseButton type="submit" class="flex-[2]" data-testid="confirm-button"
            >✓ Confirm</BaseButton
          >
        </div>
      </form>
    </section>
  </div>
</template>

<script setup>
import { nextTick, onMounted, reactive, ref } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import FoodIcon from '@/components/ui/FoodIcon.vue'
import { usePantryStore } from '@/stores/pantry'
import { useShoppingListStore } from '@/stores/shoppingList'
import { trapDialogTab } from '@/utils/dialogFocus'
import { PANTRY_UNITS, UNIT_LABELS, validateItem } from '@/utils/pantry'

const CREATE_CATEGORY = '__smartpantry_create_category__'
const props = defineProps({ items: { type: Array, required: true } })
const emit = defineEmits(['close', 'moved'])
const pantry = usePantryStore()
const shoppingList = useShoppingListStore()

// Same data-testids as the "Add item" form (US-02), inside each item block.
const FIELDS = [
  { key: 'category', label: 'Category', testId: 'category-select' },
  { key: 'quantity', label: 'Quantity', testId: 'quantity-input', type: 'number' },
  { key: 'unit', label: 'Unit', testId: 'unit-select' },
  {
    key: 'expirationDate',
    label: 'Expiration date',
    testId: 'expiration-date-input',
    type: 'date',
  },
]

const drafts = reactive(
  props.items.map((item) => ({
    id: item.id,
    name: item.name,
    scanned: Boolean(item.scanned),
    // Fields that came from the barcode (shown in grey; they can still be changed).
    prefilled: ['quantity', 'unit'].filter((key) => item.scanned?.[key]),
    category: '',
    quantity: item.scanned?.quantity || '',
    unit: item.scanned?.unit || '',
    expirationDate: '',
    creatingCategory: false,
    newCategory: '',
    categoryError: '',
  })),
)
const errors = ref({})
const saveError = ref('')
const dialog = ref(null)

function categoryChanged(draft) {
  draft.creatingCategory = draft.category === CREATE_CATEGORY
  if (draft.creatingCategory) {
    draft.category = ''
  }
}
function addCategory(draft) {
  try {
    draft.category = pantry.addCategory(draft.newCategory)
    draft.creatingCategory = false
    draft.newCategory = ''
    draft.categoryError = ''
    if (errors.value[draft.id]) errors.value[draft.id].category = ''
  } catch (error) {
    draft.categoryError = error.message
  }
}

async function confirm() {
  saveError.value = ''
  errors.value = Object.fromEntries(
    drafts
      .map((draft) => [draft.id, validateItem(draft, pantry.categories)])
      .filter(([, itemErrors]) => Object.keys(itemErrors).length),
  )
  if (Object.keys(errors.value).length) {
    saveError.value = 'Please check the highlighted fields.'
    await nextTick()
    dialog.value?.querySelector('[aria-invalid="true"]')?.scrollIntoView?.({ block: 'nearest' })
    return
  }
  try {
    shoppingList.moveToPantry(
      drafts.map(({ id, name, category, quantity, unit, expirationDate }) => ({
        id,
        name,
        category,
        quantity,
        unit,
        expirationDate,
      })),
    )
    emit('moved', drafts.length)
  } catch (error) {
    saveError.value = error.message
  }
}

function onKeydown(event) {
  if (event.key === 'Escape') {
    event.stopPropagation()
    emit('close')
  }
  trapDialogTab(event, dialog.value)
}

onMounted(() => dialog.value.focus())
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
