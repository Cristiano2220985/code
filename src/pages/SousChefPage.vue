<!--
  US-28: GenAI Sous-Chef. The selected leftovers, the active profile's dietary constraints and
  the serving size are sent to a GenAI API, which returns an original recipe with times,
  portions, measurements and steps.
-->
<template>
  <DashboardLayout>
    <div data-testid="genai-sous-chef-screen" class="mx-auto max-w-2xl">
      <RecipesTabs />
      <p class="text-[10px] font-semibold tracking-wider text-neutral-500 uppercase">
        GenAI Sous-Chef
      </p>
      <h1 class="text-xl font-bold md:text-2xl">{{ TITLES[status] }}</h1>
      <p class="mt-1 mb-4 text-sm text-neutral-500">
        Turn leftovers into an original recipe when the catalog has no match.
      </p>
      <ChefProgress :current="PROGRESS[status]" />

      <p role="status" class="sr-only">{{ announcement }}</p>

      <form v-if="status === 'form'" class="mt-5" novalidate @submit.prevent="generate">
        <IngredientPicker
          v-model:selected-ids="selectedIds"
          v-model:scraps="scraps"
          :items="pantry.items"
          :today="today"
        />
        <ChefPreferences
          v-model:servings="servings"
          v-model:note="note"
          :profile="profile"
          :removed="request.removed"
        />

        <p v-if="!canGenerate" class="mt-5 text-xs text-neutral-500">
          ⓘ Select at least one ingredient that fits the {{ profile.name }} profile to continue.
        </p>
        <BaseButton
          type="submit"
          data-testid="genai-sous-chef-generate-button"
          class="mt-3 w-full"
          :disabled="!canGenerate"
        >
          Generate Recipe · {{ request.ingredients.length }} to use
        </BaseButton>
      </form>

      <section v-else-if="status === 'loading'" class="mt-5 space-y-4" aria-busy="true">
        <div class="rounded-xl border border-dashed border-neutral-300 px-5 py-8 text-center">
          <p class="font-semibold">The Sous-Chef is cooking up an idea</p>
          <p class="mt-1 text-xs text-neutral-500">
            Combining your leftovers into an original dish. This usually takes a few seconds.
          </p>
        </div>
        <ChefRequestSummary :request="sentRequest" />
        <BaseButton variant="secondary" class="w-full" @click="cancel">Cancel</BaseButton>
      </section>

      <section v-else-if="status === 'error'" class="mt-5 space-y-4" role="alert">
        <div class="rounded-xl border border-neutral-700 p-4">
          <p class="font-semibold">The Sous-Chef is unavailable</p>
          <p class="mt-1 text-sm text-neutral-600">{{ error }}</p>
          <p class="mt-1 text-xs text-neutral-500">Your selection was kept.</p>
        </div>
        <ChefRequestSummary :request="sentRequest" />
        <p class="text-xs text-neutral-500">
          ⓘ Catalog recipes stay available in Recipes → Catalog recipes.
        </p>
        <div class="grid grid-cols-2 gap-2">
          <BaseButton variant="secondary" @click="status = 'form'">Edit</BaseButton>
          <BaseButton @click="generate">↻ Try again</BaseButton>
        </div>
      </section>

      <section v-else class="mt-5">
        <GeneratedRecipe :recipe="recipe" :profile-name="sentRequest.profile.name">
          <template #badges>
            <ul class="mt-3 flex flex-wrap gap-1.5" aria-label="Dietary constraints respected">
              <li
                v-for="badge in constraintBadges(sentRequest.profile)"
                :key="badge"
                class="rounded border border-neutral-300 px-2 py-0.5 text-[11px] text-neutral-600"
              >
                ✓ {{ badge }}
              </li>
            </ul>
          </template>
        </GeneratedRecipe>
        <div class="mt-5 grid grid-cols-2 gap-2">
          <BaseButton variant="secondary" @click="status = 'form'">Edit</BaseButton>
          <BaseButton variant="secondary" @click="generate">↻ Regenerate</BaseButton>
        </div>
      </section>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import RecipesTabs from '@/components/recipes/RecipesTabs.vue'
import ChefPreferences from '@/components/sousChef/ChefPreferences.vue'
import ChefProgress from '@/components/sousChef/ChefProgress.vue'
import ChefRequestSummary from '@/components/sousChef/ChefRequestSummary.vue'
import GeneratedRecipe from '@/components/sousChef/GeneratedRecipe.vue'
import IngredientPicker from '@/components/sousChef/IngredientPicker.vue'
import { generateRecipe } from '@/services/sousChef'
import { usePantryStore } from '@/stores/pantry'
import { useProfilesStore } from '@/stores/profiles'
import { buildRequest, constraintBadges } from '@/utils/sousChef'

// status: 'form' (choose leftovers) → 'loading' → 'done' (recipe) or 'error'
const TITLES = {
  form: 'What needs using up?',
  loading: 'Creating your recipe…',
  error: "Couldn't create a recipe",
  done: 'Your AI recipe',
}
const PROGRESS = { form: 0, loading: 2, error: 2, done: 2 }

const pantry = usePantryStore()
const profiles = useProfilesStore()
const profile = computed(() => profiles.activeProfile)
const today = new Date()

const selectedIds = ref([])
const scraps = ref([])
const servings = ref(profile.value.servings)
const note = ref('')
const status = ref('form')
const recipe = ref(null)
const error = ref('')
const sentRequest = ref(null)
const announcement = ref('')

const request = computed(() =>
  buildRequest({
    pantryItems: pantry.items,
    selectedIds: selectedIds.value,
    scraps: scraps.value,
    servings: servings.value,
    note: note.value,
    profile: profile.value,
  }),
)
const canGenerate = computed(() => request.value.ingredients.length > 0)

let controller = null

// The selection is kept, so "Try again" and "Regenerate" send the same request again.
async function generate() {
  if (!canGenerate.value) return
  controller?.abort()
  controller = new AbortController()
  const { signal } = controller
  sentRequest.value = request.value
  status.value = 'loading'
  announcement.value = 'Creating your recipe…'
  try {
    const result = await generateRecipe(sentRequest.value, { signal })
    if (signal.aborted) return
    recipe.value = result
    status.value = 'done'
    announcement.value = `Recipe ready: ${result.name}.`
  } catch (err) {
    if (signal.aborted) return
    error.value = err.message
    status.value = 'error'
    announcement.value = "Couldn't create a recipe."
  }
}

function cancel() {
  controller?.abort()
  status.value = 'form'
  announcement.value = ''
}

// Switching profile changes the constraints and the default servings, so the user goes
// back to the form (keeping the selected leftovers) to generate a recipe for the new profile.
watch(
  () => profiles.activeProfileId,
  () => {
    if (!profile.value) return
    controller?.abort()
    servings.value = profile.value.servings
    status.value = 'form'
  },
)

onBeforeUnmount(() => controller?.abort())
</script>
