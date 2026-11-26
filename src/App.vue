<script setup>
import { computed, onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'
import { RouterView } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'

const offline = ref(!navigator.onLine)
const installPrompt = shallowRef(null)
const installHelp = window.isSecureContext ? getInstallHelp() : ''
const helpOpen = ref(false)
const installed = ref(
  navigator.standalone === true ||
    window.matchMedia?.('(display-mode: standalone)')?.matches === true,
)
const canInstall = computed(() => !installed.value && Boolean(installPrompt.value || installHelp))
const canShowHelp = computed(() => Boolean(installHelp && !installPrompt.value))

function getInstallHelp() {
  const { userAgent, platform, maxTouchPoints, vendor } = navigator
  if (/iPhone|iPad|iPod/.test(userAgent) || (platform === 'MacIntel' && maxTouchPoints > 1)) {
    return 'Open the Share menu and choose Add to Home Screen. Keep Open as Web App on if shown.'
  }
  if (/Android/.test(userAgent) || navigator.userAgentData?.platform === 'Android') {
    return 'Open the browser menu and choose Install app or Add to Home screen. In Chrome, look for Install and create shortcut.'
  }
  if (vendor === 'Apple Computer, Inc.' && /Macintosh.*Safari\//.test(userAgent)) {
    return 'In Safari, choose File → Add to Dock. This option is available on macOS Sonoma or later.'
  }
  return ''
}

function updateConnectivity() {
  offline.value = !navigator.onLine
}

function offerInstallation(event) {
  event.preventDefault()
  installPrompt.value = event
  helpOpen.value = false
}

function markInstalled() {
  installed.value = true
  installPrompt.value = null
  helpOpen.value = false
}

async function install() {
  const prompt = installPrompt.value
  if (!prompt) {
    helpOpen.value = !helpOpen.value
    return
  }

  installPrompt.value = null
  try {
    const { outcome } = await prompt.prompt()
    if (outcome === 'accepted') markInstalled()
  } catch (error) {
    helpOpen.value = Boolean(installHelp)
    console.warn('SmartPantry could not open the browser installation prompt.', error)
  }
}

onMounted(() => {
  window.addEventListener('online', updateConnectivity)
  window.addEventListener('offline', updateConnectivity)
  window.addEventListener('beforeinstallprompt', offerInstallation)
  window.addEventListener('appinstalled', markInstalled)
})

onBeforeUnmount(() => {
  window.removeEventListener('online', updateConnectivity)
  window.removeEventListener('offline', updateConnectivity)
  window.removeEventListener('beforeinstallprompt', offerInstallation)
  window.removeEventListener('appinstalled', markInstalled)
})
</script>

<template>
  <div
    v-if="offline || canInstall"
    class="flex flex-wrap items-center gap-x-3 gap-y-2 bg-canvas px-5 pt-[max(0.75rem,env(safe-area-inset-top))] pb-1 md:px-8"
  >
    <p
      v-if="offline"
      role="status"
      data-testid="offline-status"
      class="flex items-center gap-2 rounded-full bg-surface py-1.5 pr-3.5 pl-3 text-xs text-ink-soft before:h-2 before:w-2 before:rounded-full before:bg-status-soon before:content-['']"
    >
      <strong>Offline.</strong> You can use your pantry and shopping list.
    </p>
    <BaseButton
      v-if="canInstall"
      class="ml-auto !px-4 !py-2 !text-xs"
      data-testid="install-app-button"
      :aria-expanded="canShowHelp ? helpOpen : undefined"
      :aria-controls="canShowHelp ? 'pwa-install-help' : undefined"
      @click="install"
    >
      Install app
    </BaseButton>
    <p
      v-if="canInstall && canShowHelp"
      v-show="helpOpen"
      id="pwa-install-help"
      class="card basis-full rounded-[20px] bg-surface p-3.5 text-xs leading-relaxed text-ink-soft"
    >
      {{ installHelp }}
    </p>
  </div>
  <RouterView />
</template>
