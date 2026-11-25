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
        <h2
          id="item-dialog-title"
          class="text-[28px] leading-[1.05] font-semibold tracking-[-0.04em]"
        >
          {{ view === 'upload' ? 'Upload image' : 'Scan barcode' }}
        </h2>
        <p class="mt-1.5 text-sm text-muted">
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
        class="card pressable flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface text-xl leading-none"
        @click="$emit('close')"
      >
        ×
      </button>
    </div>

    <!-- 1. Camera / messages -->
    <template v-if="view === 'scanner'">
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
          class="relative flex aspect-video items-center justify-center overflow-hidden rounded-[28px] bg-ink"
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
            class="pointer-events-none absolute inset-x-[15%] inset-y-[25%] rounded-[18px] border-2 border-lime shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]"
            aria-hidden="true"
          />
        </div>
        <p role="status" class="mt-3 text-center text-xs text-muted">
          {{ statusMessage }}
        </p>
      </template>

      <!-- 2. Type the barcode number -->
      <form class="mt-5" @submit.prevent="lookupTypedCode">
        <label for="barcode-number" class="mb-2 block px-1 text-sm font-medium text-ink">
          Or type the barcode number
        </label>
        <div
          class="card flex items-center gap-2 rounded-full bg-surface p-1.5 pl-4 ring-1"
          :class="typedCodeError ? 'ring-status-today' : 'ring-transparent'"
        >
          <input
            id="barcode-number"
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
    </template>

    <!-- 3. Upload a photo of the barcode -->
    <template v-else>
      <label
        for="barcode-image"
        class="pressable flex cursor-pointer flex-col items-center rounded-[26px] border border-dashed border-hairline bg-surface/60 p-8 text-center hover:bg-surface"
      >
        <span
          class="card flex h-14 w-14 items-center justify-center rounded-[20px] bg-surface"
          aria-hidden="true"
          ><AppIcon name="barcode" class="h-6 w-6"
        /></span>
        <span class="mt-3 text-xs text-muted">Supports JPG and PNG files</span>
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
      <p v-if="uploadError" role="alert" class="mt-2 px-1 text-xs text-status-today">
        {{ uploadError }}
      </p>
    </template>

    <!-- Fallback options -->
    <div data-testid="barcode-fallback-options" class="mt-5 flex flex-col gap-2 sm:flex-row">
      <BaseButton
        v-if="view === 'scanner'"
        :variant="problem ? 'primary' : 'secondary'"
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
    <p v-if="problem" class="mt-3 text-center text-xs text-muted">
      You can continue without scanning.
    </p>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { BrowserMultiFormatReader } from '@zxing/browser'
import { BarcodeFormat, DecodeHintType } from '@zxing/library'
import AppIcon from '@/components/ui/AppIcon.vue'
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
const state = ref('starting')
const video = ref(null)
const fileInput = ref(null)
const typedCode = ref('')
const typedCodeError = ref('')
const uploadError = ref('')
const searching = ref(false)
let cameraControls = null
let closed = false

const problems = {
  'camera-unavailable': {
    title: 'Camera access is not available',
    description: 'You can still add the product using a photo or by typing its details.',
  },
  'product-not-found': {
    title: 'Product not found',
    description: 'Try another barcode or enter the item details manually.',
  },
  'lookup-unavailable': {
    title: 'Online product lookup is unavailable',
    description: 'Check your connection and try again, or enter the item details manually.',
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
  if (closed || searching.value) return
  searching.value = true
  stopCamera()
  if (view.value === 'scanner') state.value = 'searching'

  try {
    const product = await findProductByBarcode(code)
    if (closed) return
    if (product) {
      emit('found', { ...product, barcode: code })
      return
    }
    view.value = 'scanner'
    state.value = 'product-not-found'
  } catch {
    if (closed) return
    view.value = 'scanner'
    state.value = 'lookup-unavailable'
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
  @apply h-12 w-full rounded-2xl bg-surface px-3.5 text-ink ring-1 ring-hairline outline-none placeholder:text-muted focus:ring-2 focus:ring-ink;
}
.field[aria-invalid='true'] {
  @apply ring-status-today;
}
</style>
