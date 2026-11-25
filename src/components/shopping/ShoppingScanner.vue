<!--
  US-09: barcode scanner for one shopping list item.
  Live camera or typed barcode number (no image upload: the app is mobile first).
  Emits:
    found(product) -> { name, quantity, unit, barcode }
    close          -> back to the shopping list
-->
<template>
  <div data-testid="shopping-list-scanner-screen" class="flex h-full flex-col">
    <div
      class="flex items-start justify-between gap-3 px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-2"
    >
      <div>
        <p class="text-sm text-muted">Point the camera at the barcode of the product.</p>
        <h2
          id="shopping-list-title"
          class="mt-1 text-[34px] leading-[1.05] font-semibold tracking-[-0.045em]"
        >
          Scan item
        </h2>
      </div>
      <button
        type="button"
        aria-label="Close barcode scanner"
        data-testid="close-barcode-scanner-button"
        class="card pressable flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface text-xl leading-none"
        @click="$emit('close')"
      >
        ×
      </button>
    </div>

    <div class="flex-1 overflow-y-auto px-5 pt-3 pb-6">
      <p
        class="mb-4 inline-flex items-center gap-2 rounded-full bg-lime py-1.5 pr-3.5 pl-1.5 text-xs text-lime-ink"
      >
        <FoodIcon
          :name="itemName"
          size="sm"
          rounded="rounded-full"
          class="!h-6 !w-6 !bg-white/60"
        />
        <span
          >Scanning for <strong class="font-semibold">{{ itemName }}</strong></span
        >
      </p>

      <div
        v-if="problem"
        class="card flex flex-col items-center rounded-[26px] bg-surface px-6 py-8 text-center"
      >
        <span
          class="flex h-12 w-12 items-center justify-center rounded-full bg-status-today/10 text-lg font-bold text-status-today"
          aria-hidden="true"
          >!</span
        >
        <p
          role="alert"
          class="mt-4 text-[17px] font-semibold tracking-tight"
          :data-testid="`barcode-${state}-message`"
        >
          {{ problem.title }}
        </p>
        <p class="mt-1 max-w-xs text-xs text-muted">
          {{ problem.description }}
        </p>
      </div>

      <template v-else>
        <div
          class="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-[28px] bg-ink"
        >
          <video
            ref="video"
            data-testid="barcode-scanner-preview"
            class="h-full w-full object-cover"
            muted
            playsinline
            aria-label="Camera preview"
          />
          <div
            class="pointer-events-none absolute inset-x-[15%] inset-y-[28%] rounded-[18px] border-2 border-lime shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]"
            aria-hidden="true"
          />
        </div>
        <p role="status" class="mt-3 text-center text-xs text-muted">
          {{ statusMessage }}
        </p>
      </template>

      <form class="mt-5" @submit.prevent="lookupTypedCode">
        <label for="shopping-barcode-number" class="mb-2 block px-1 text-sm font-medium text-ink">
          Or type the barcode number
        </label>
        <div
          class="card flex items-center gap-2 rounded-full bg-surface p-1.5 pl-4 ring-1"
          :class="typedCodeError ? 'ring-status-today' : 'ring-transparent'"
        >
          <input
            id="shopping-barcode-number"
            v-model="typedCode"
            data-testid="barcode-number-input"
            inputmode="numeric"
            autocomplete="off"
            placeholder="e.g. 3017620422003"
            class="min-w-0 flex-1 bg-transparent py-2 outline-none placeholder:text-muted"
            :aria-invalid="Boolean(typedCodeError)"
          />
          <BaseButton
            type="submit"
            data-testid="barcode-lookup-button"
            class="!px-5 !py-2.5"
            :disabled="searching"
            >Look up</BaseButton
          >
        </div>
        <p v-if="typedCodeError" role="alert" class="mt-2 px-1 text-xs text-status-today">
          {{ typedCodeError }}
        </p>
      </form>

      <BaseButton
        variant="secondary"
        class="mt-5 w-full"
        data-testid="cancel-button"
        @click="$emit('close')"
        >Cancel</BaseButton
      >
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { BrowserMultiFormatReader } from '@zxing/browser'
import { BarcodeFormat, DecodeHintType } from '@zxing/library'
import BaseButton from '@/components/ui/BaseButton.vue'
import FoodIcon from '@/components/ui/FoodIcon.vue'
import { findProductByBarcode, isValidBarcode } from '@/services/products'

defineProps({ itemName: { type: String, required: true } })
const emit = defineEmits(['found', 'close'])

// Only product barcodes, so the reader is faster.
const reader = new BrowserMultiFormatReader(
  new Map([
    [
      DecodeHintType.POSSIBLE_FORMATS,
      [BarcodeFormat.EAN_13, BarcodeFormat.EAN_8, BarcodeFormat.UPC_A, BarcodeFormat.UPC_E],
    ],
  ]),
)

const state = ref('starting')
const video = ref(null)
const typedCode = ref('')
const typedCodeError = ref('')
const searching = ref(false)
let cameraControls = null
let closed = false

const problems = {
  'camera-unavailable': {
    title: 'Camera access is not available',
    description: 'You can type the barcode number below, or go back and tick the item.',
  },
  'product-not-found': {
    title: 'Product not found',
    description: 'Try another barcode, or go back and tick the item.',
  },
  'lookup-unavailable': {
    title: 'Online product lookup is unavailable',
    description: 'Check your connection and try again, or go back and tick the item.',
  },
}
const problem = computed(() => problems[state.value])
const statusMessage = computed(
  () =>
    ({
      starting: 'Waiting for camera access…',
      scanning: 'Point your camera at the product barcode.',
      searching: 'Looking up the product…',
    })[state.value],
)

async function startCamera() {
  // The camera needs a secure page (https or localhost).
  if (!navigator.mediaDevices?.getUserMedia) {
    state.value = 'camera-unavailable'
    return
  }
  try {
    cameraControls = await reader.decodeFromConstraints(
      { video: { facingMode: 'environment' } },
      video.value,
      (result) => {
        if (result) lookup(result.getText())
      },
    )
    // The user may have typed a code or closed the scanner while the camera was starting.
    if (closed || state.value !== 'starting') stopCamera()
    else state.value = 'scanning'
  } catch {
    // Permission denied, no camera, or the camera is being used by another app.
    if (!closed && state.value === 'starting') state.value = 'camera-unavailable'
  }
}

function stopCamera() {
  cameraControls?.stop()
  cameraControls = null
}

async function lookup(code) {
  if (closed || searching.value) return
  searching.value = true
  stopCamera()
  state.value = 'searching'
  try {
    const product = await findProductByBarcode(code)
    if (closed) return
    if (product) emit('found', { ...product, barcode: code })
    else state.value = 'product-not-found'
  } catch {
    if (!closed) state.value = 'lookup-unavailable'
  } finally {
    searching.value = false
  }
}

function lookupTypedCode() {
  const code = typedCode.value.replace(/\s/g, '')
  if (!isValidBarcode(code)) {
    typedCodeError.value = 'Enter a barcode with 8 to 14 digits.'
    return
  }
  typedCodeError.value = ''
  lookup(code)
}

onMounted(startCamera)
onBeforeUnmount(() => {
  closed = true
  stopCamera()
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
