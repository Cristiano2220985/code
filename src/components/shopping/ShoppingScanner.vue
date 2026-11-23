<!--
  US-09: barcode scanner for one shopping list item.
  Live camera or typed barcode number (no image upload: the app is mobile first).
  Emits:
    found(product) -> { name, quantity, unit, barcode }
    close          -> back to the shopping list
-->
<template>
  <div data-testid="shopping-list-scanner-screen" class="flex h-full flex-col">
    <div class="flex items-start justify-between gap-3 border-b border-neutral-200 p-5">
      <div>
        <h2 id="shopping-list-title" class="text-xl font-bold">Scan item</h2>
        <p class="mt-1 text-xs text-neutral-500">Point the camera at the barcode of the product.</p>
      </div>
      <button
        type="button"
        aria-label="Close barcode scanner"
        data-testid="close-barcode-scanner-button"
        class="rounded p-2 text-xl hover:bg-neutral-100"
        @click="$emit('close')"
      >
        ×
      </button>
    </div>

    <div class="flex-1 overflow-y-auto p-5">
      <p
        class="mb-3 inline-block rounded-full border border-neutral-300 px-2.5 py-1 text-xs text-neutral-600"
      >
        Scanning for <strong>{{ itemName }}</strong>
      </p>

      <div v-if="problem" class="flex flex-col items-center py-4 text-center">
        <span
          class="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-400 text-lg font-bold"
          aria-hidden="true"
          >!</span
        >
        <p role="alert" class="mt-3 text-base font-bold" :data-testid="`barcode-${state}-message`">
          {{ problem.title }}
        </p>
        <p class="mt-1 max-w-xs text-xs text-neutral-500">
          {{ problem.description }}
        </p>
      </div>

      <template v-else>
        <div
          class="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl bg-neutral-800"
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
            class="pointer-events-none absolute inset-x-[15%] inset-y-[28%] rounded-lg border-2 border-white/90 shadow-[0_0_0_9999px_rgba(0,0,0,0.25)]"
            aria-hidden="true"
          />
        </div>
        <p role="status" class="mt-2 text-center text-xs text-neutral-500">
          {{ statusMessage }}
        </p>
      </template>

      <form class="mt-4 rounded-lg border border-neutral-300 p-3" @submit.prevent="lookupTypedCode">
        <label
          for="shopping-barcode-number"
          class="mb-2 block text-xs font-semibold text-neutral-600"
        >
          Or type the barcode number
        </label>
        <div class="flex gap-2">
          <input
            id="shopping-barcode-number"
            v-model="typedCode"
            data-testid="barcode-number-input"
            inputmode="numeric"
            autocomplete="off"
            placeholder="e.g. 3017620422003"
            class="field min-w-0 flex-1"
            :aria-invalid="Boolean(typedCodeError)"
          />
          <BaseButton type="submit" data-testid="barcode-lookup-button" :disabled="searching"
            >Look up</BaseButton
          >
        </div>
        <p v-if="typedCodeError" role="alert" class="mt-1 text-xs text-red-700">
          {{ typedCodeError }}
        </p>
      </form>

      <BaseButton
        variant="secondary"
        class="mt-4 w-full"
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
  @apply w-full rounded-lg border border-neutral-300 bg-neutral-50 px-3 py-2.5 text-neutral-900 outline-none focus:border-neutral-800 focus:ring-1 focus:ring-neutral-800;
}
.field[aria-invalid='true'] {
  @apply border-red-600;
}
</style>
