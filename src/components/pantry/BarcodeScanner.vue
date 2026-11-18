<!--
  Barcode scanner shown inside the "Add item" dialog.
  Three ways to get a barcode: the device camera, typing the number, or uploading a photo.
  Emits:
    found(product)  -> { name, quantity, unit, barcode } to auto-fill the item form
    manual          -> the user wants to type the item details
    close           -> back to the item form
-->
<template>
  <div data-testid="barcode-scanner-screen">
    <div class="mb-4 flex items-start justify-between gap-3">
      <div>
        <h2 id="item-dialog-title" class="text-xl font-bold">
          {{ view === 'upload' ? 'Upload image' : 'Scan barcode' }}
        </h2>
        <p class="mt-1 text-xs text-neutral-500">
          {{
            view === 'upload'
              ? 'Choose a clear photo of a product barcode.'
              : 'Place the barcode inside the frame.'
          }}
        </p>
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

    <!-- 1. Camera / messages -->
    <template v-if="view === 'scanner'">
      <div
        v-if="state === 'camera-unavailable' || state === 'not-found'"
        class="flex flex-col items-center py-4 text-center"
      >
        <span
          class="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-400 text-lg font-bold"
          aria-hidden="true"
          >!</span
        >
        <p
          v-if="state === 'camera-unavailable'"
          role="alert"
          class="mt-3 text-base font-bold"
          data-testid="barcode-camera-unavailable-message"
        >
          Camera access is not available
        </p>
        <p
          v-else
          role="alert"
          class="mt-3 text-base font-bold"
          data-testid="barcode-product-not-found-message"
        >
          Product not found
        </p>
        <p class="mt-1 max-w-xs text-xs text-neutral-500">
          {{
            state === 'camera-unavailable'
              ? 'Camera permission is denied. You can still add the product using a photo or by typing its details.'
              : 'We could not find this barcode in the product catalogue. You can try a photo or enter the item details yourself.'
          }}
        </p>
      </div>

      <template v-else>
        <div
          class="relative flex aspect-video items-center justify-center overflow-hidden rounded-xl bg-neutral-100"
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
            class="pointer-events-none absolute inset-x-[15%] inset-y-[25%] rounded-lg border-2 border-white/90 shadow-[0_0_0_9999px_rgba(0,0,0,0.25)]"
            aria-hidden="true"
          />
        </div>
        <p role="status" class="mt-2 text-center text-xs text-neutral-500">
          {{ statusMessage }}
        </p>
      </template>

      <!-- 2. Type the barcode number -->
      <form class="mt-4 rounded-lg border border-neutral-300 p-3" @submit.prevent="lookupTypedCode">
        <label for="barcode-number" class="mb-2 block text-xs font-semibold text-neutral-600">
          Or type the barcode number
        </label>
        <div class="flex gap-2">
          <input
            id="barcode-number"
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
    </template>

    <!-- 3. Upload a photo of the barcode -->
    <template v-else>
      <label
        for="barcode-image"
        class="flex cursor-pointer flex-col items-center rounded-xl border border-dashed border-neutral-400 p-8 text-center hover:bg-neutral-50"
      >
        <span class="font-mono text-2xl tracking-tighter" aria-hidden="true">||| || |||</span>
        <span class="mt-2 text-xs text-neutral-500">Supports JPG and PNG files</span>
      </label>
      <input
        id="barcode-image"
        ref="fileInput"
        type="file"
        accept="image/*"
        class="sr-only"
        data-testid="barcode-image-file-input"
        @change="readImage"
      />
      <BaseButton
        class="mt-3 w-full"
        data-testid="choose-image-button"
        :disabled="searching"
        @click="fileInput.click()"
        >{{ searching ? 'Reading image…' : 'Choose image' }}</BaseButton
      >
      <p v-if="uploadError" role="alert" class="mt-2 text-xs text-red-700">
        {{ uploadError }}
      </p>
    </template>

    <!-- Fallback options -->
    <div data-testid="barcode-fallback-options" class="mt-4 flex flex-col gap-2 sm:flex-row">
      <BaseButton
        v-if="view === 'scanner'"
        :variant="hasProblem ? 'primary' : 'secondary'"
        class="flex-1"
        data-testid="upload-image-button"
        @click="openUpload"
        >Upload image</BaseButton
      >
      <BaseButton
        variant="secondary"
        class="flex-1"
        data-testid="enter-manually-button"
        @click="$emit('manual')"
        >{{ view === 'upload' ? 'Enter manually instead' : 'Enter manually' }}</BaseButton
      >
    </div>
    <p v-if="hasProblem" class="mt-3 text-center text-xs text-neutral-500">
      You can continue without scanning.
    </p>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { BrowserMultiFormatReader } from '@zxing/browser'
import { BarcodeFormat, DecodeHintType } from '@zxing/library'
import BaseButton from '@/components/ui/BaseButton.vue'
import { findProductByBarcode, isValidBarcode } from '@/services/products'

const emit = defineEmits(['found', 'manual', 'close'])

// Only product barcodes, so the reader is faster.
const hints = new Map([
  [
    DecodeHintType.POSSIBLE_FORMATS,
    [BarcodeFormat.EAN_13, BarcodeFormat.EAN_8, BarcodeFormat.UPC_A, BarcodeFormat.UPC_E],
  ],
])
const reader = new BrowserMultiFormatReader(hints)

const view = ref('scanner') // 'scanner' | 'upload'
// 'starting' | 'scanning' | 'searching' | 'camera-unavailable' | 'not-found'
const state = ref('starting')
const video = ref(null)
const fileInput = ref(null)
const typedCode = ref('')
const typedCodeError = ref('')
const uploadError = ref('')
const searching = ref(false)
let cameraControls = null
let closed = false

const hasProblem = computed(() => ['camera-unavailable', 'not-found'].includes(state.value))
const statusMessage = computed(
  () =>
    ({
      starting: 'Waiting for camera access…',
      scanning: 'Point your camera at the product barcode.',
      searching: 'Looking up the product…',
    })[state.value],
)

// Camera ---------------------------------------------------------------------

async function startCamera() {
  // The camera needs a secure page (https or localhost).
  if (!navigator.mediaDevices?.getUserMedia) {
    state.value = 'camera-unavailable'
    return
  }
  state.value = 'starting'
  try {
    cameraControls = await reader.decodeFromConstraints(
      { video: { facingMode: 'environment' } },
      video.value,
      (result) => {
        if (result) lookup(result.getText())
      },
    )
    // The user may have typed a code or opened the upload while the camera was starting.
    if (closed || view.value !== 'scanner' || state.value !== 'starting') stopCamera()
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

// Product lookup ---------------------------------------------------------------

async function lookup(code) {
  if (searching.value) return
  searching.value = true
  stopCamera()
  if (view.value === 'scanner') state.value = 'searching'

  const product = await findProductByBarcode(code)
  searching.value = false
  if (closed) return

  if (product) {
    emit('found', { ...product, barcode: code })
  } else {
    view.value = 'scanner'
    state.value = 'not-found'
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

// Upload ---------------------------------------------------------------------

function openUpload() {
  stopCamera()
  view.value = 'upload'
  uploadError.value = ''
}

async function readImage(event) {
  const file = event.target.files?.[0]
  if (!file) return
  uploadError.value = ''
  const url = URL.createObjectURL(file)
  let code = null
  try {
    code = (await reader.decodeFromImageUrl(url)).getText()
  } catch {
    uploadError.value =
      'We could not read a barcode in this image. Try a clearer photo or enter the details manually.'
  } finally {
    URL.revokeObjectURL(url)
    event.target.value = ''
  }
  if (code) await lookup(code)
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
  @apply w-full rounded-lg border border-neutral-300 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-900 outline-none focus:border-neutral-800 focus:ring-1 focus:ring-neutral-800;
}
.field[aria-invalid='true'] {
  @apply border-red-600;
}
</style>
