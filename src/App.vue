<script setup>
import { onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'
import { RouterView } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'

const offline = ref(!navigator.onLine)
const installPrompt = shallowRef(null)

function updateConnectivity() {
  offline.value = !navigator.onLine
}

function offerInstallation(event) {
  event.preventDefault()
  installPrompt.value = event
}

function clearInstallPrompt() {
  installPrompt.value = null
}

async function install() {
  const prompt = installPrompt.value
  clearInstallPrompt()
  try {
    await prompt?.prompt()
  } catch (error) {
    console.warn('SmartPantry could not open the browser installation prompt.', error)
  }
}

onMounted(() => {
  window.addEventListener('online', updateConnectivity)
  window.addEventListener('offline', updateConnectivity)
  window.addEventListener('beforeinstallprompt', offerInstallation)
  window.addEventListener('appinstalled', clearInstallPrompt)
})

onBeforeUnmount(() => {
  window.removeEventListener('online', updateConnectivity)
  window.removeEventListener('offline', updateConnectivity)
  window.removeEventListener('beforeinstallprompt', offerInstallation)
  window.removeEventListener('appinstalled', clearInstallPrompt)
})
</script>

<template>
  <div
    v-if="offline || installPrompt"
    class="flex flex-wrap items-center gap-2 border-b border-neutral-200 bg-neutral-50 px-4 py-2 md:px-6"
  >
    <p v-if="offline" role="status" data-testid="offline-status" class="text-sm text-neutral-700">
      <strong>Offline.</strong> You can use your pantry and shopping list.
    </p>
    <BaseButton
      v-if="installPrompt"
      class="ml-auto"
      data-testid="install-app-button"
      @click="install"
    >
      Install app
    </BaseButton>
  </div>
  <RouterView />
</template>
