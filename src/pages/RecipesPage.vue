<!--
  US-19: recipe discovery. Recipes come from TheMealDB and are matched against the pantry:
  overlap percentage, expiring items first, and the active profile's restrictions applied.
-->
<template>
  <DashboardLayout>
    <div data-testid="recipe-discovery-screen">
      <h1 class="text-xl font-bold md:text-2xl">Discover recipes</h1>
      <p class="mt-1 text-sm text-neutral-500">
        Find meals you can prepare with the ingredients you already have.
      </p>

      <section
        class="mt-5 flex gap-3 rounded-xl border border-neutral-300 p-4"
        aria-labelledby="recipes-pantry-title"
      >
        <div class="min-w-0">
          <h2 id="recipes-pantry-title" class="text-sm font-semibold">
            Available in your pantry
            <span class="font-normal text-neutral-500">({{ pantry.items.length }})</span>
          </h2>
          <p v-if="!pantry.items.length" class="mt-1 text-xs text-neutral-500">
            Your pantry is empty. Add items to find recipes that use them.
          </p>
          <ul v-else class="mt-2 flex flex-wrap gap-1.5">
            <li
              v-for="item in pantry.items"
              :key="item.id"
              class="rounded-md border px-2 py-0.5 text-xs"
              :class="
                isExpiring(item)
                  ? 'border-2 border-neutral-700 font-semibold'
                  : 'border-neutral-300'
              "
            >
              {{ item.name }}
              <span class="font-normal text-neutral-500">{{ quantityLabel(item) }}</span>
              <span v-if="isExpiring(item)" class="font-normal text-neutral-500">
                · expires {{ expirationLabel(item.expirationDate, today).toLowerCase() }}</span
              >
            </li>
          </ul>
        </div>
      </section>

      <form
        class="mt-4 rounded-xl border border-neutral-300 p-4"
        novalidate
        @submit.prevent="search"
      >
        <label for="recipes-query" class="sr-only">Search by recipe or ingredient</label>
        <div class="flex flex-col gap-2 sm:flex-row">
          <input
            id="recipes-query"
            v-model="query"
            type="search"
            autocomplete="off"
            placeholder="Search by recipe or ingredient..."
            class="min-w-0 flex-1 rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-neutral-800 focus:ring-1 focus:ring-neutral-800"
          />
          <BaseButton
            type="submit"
            data-testid="recipes-search-button"
            :disabled="status === 'loading'"
          >
            Search Recipes
          </BaseButton>
        </div>
        <div
          class="mt-3 flex flex-col gap-1 text-xs text-neutral-500 sm:flex-row sm:justify-between"
        >
          <span>Expiring ingredients first, then best pantry match</span>
          <span
            >Based on your active household profile:
            <b class="text-neutral-900">{{ profiles.activeProfile?.name }}</b></span
          >
        </div>
      </form>

      <p role="status" class="sr-only">{{ announcement }}</p>

      <section
        v-if="status === 'idle'"
        class="mt-5 rounded-xl border border-dashed border-neutral-300 px-5 py-10 text-center"
      >
        <p class="font-semibold">Find meals with what you have</p>
        <p class="mt-1 text-xs text-neutral-500">
          Tap Search Recipes to match recipes to the {{ pantry.items.length }} ingredients in your
          pantry.
        </p>
      </section>
      <p v-else-if="status === 'loading'" class="mt-5 text-sm text-neutral-500">
        Searching recipes…
      </p>
      <p
        v-else-if="status === 'error'"
        class="mt-5 rounded-lg border border-neutral-700 p-4 text-sm"
      >
        {{ error }} Check your connection and try again.
      </p>

      <section
        v-else
        class="mt-6"
        data-testid="recipes-search-results"
        aria-labelledby="recipes-results-title"
      >
        <h2 id="recipes-results-title" class="font-semibold">
          Matching recipes
          <span class="font-normal text-neutral-500">({{ visibleMatches.length }})</span>
        </h2>
        <p class="text-xs text-neutral-500">Results are matched to the current pantry.</p>
        <p
          v-if="listMessage && !selected"
          role="status"
          class="mt-3 rounded-lg bg-neutral-800 px-3 py-2 text-xs font-semibold text-white"
        >
          {{ listMessage }}
        </p>
        <p
          v-if="hiddenCount"
          class="mt-3 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-600"
        >
          Recipes that do not match the {{ profiles.activeProfile?.name }} profile are hidden.
        </p>
        <p v-if="!visibleMatches.length" class="mt-4 text-sm text-neutral-500">
          {{
            pantry.items.length
              ? 'No recipes found for your pantry.'
              : 'Add items to your pantry to find recipes.'
          }}
        </p>
        <div class="mt-4 grid gap-4 md:grid-cols-2">
          <RecipeCard
            v-for="match in visibleMatches"
            :key="match.recipe.id"
            :match="match"
            @open="selected = $event"
            @add-missing="addMissing"
          />
        </div>
      </section>
    </div>

    <RecipeDetailPanel
      v-if="selected"
      :match="selected"
      :message="listMessage"
      @close="closeDetail"
      @add-missing="addMissing"
    />
  </DashboardLayout>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import RecipeCard from '@/components/recipes/RecipeCard.vue'
import RecipeDetailPanel from '@/components/recipes/RecipeDetailPanel.vue'
import { usePantryStore } from '@/stores/pantry'
import { useProfilesStore } from '@/stores/profiles'
import { useAddMissing } from '@/composables/useAddMissing'
import { findCandidates, loadRecipes } from '@/services/recipes'
import { daysUntilExpiration, expirationLabel, UNIT_LABELS } from '@/utils/pantry'
import { matchRecipe, normalizeIngredient, rankMatches, violatesProfile } from '@/utils/recipes'

const pantry = usePantryStore()
const profiles = useProfilesStore()
const { message: listMessage, addMissing } = useAddMissing()

const today = new Date()
const status = ref('idle'),
  error = ref(''),
  matches = ref([]),
  hiddenCount = ref(0),
  query = ref(''),
  selected = ref(null),
  announcement = ref('')

// Same rule as the pantry alert tray: expires today or tomorrow (within 48 hours).
const isExpiring = (item) => {
  const days = daysUntilExpiration(item.expirationDate, today)
  return days >= 0 && days <= 1
}
const quantityLabel = (item) => `${item.quantity} ${UNIT_LABELS[item.unit] ?? item.unit}`

const visibleMatches = computed(() => {
  const text = normalizeIngredient(query.value)
  if (!text) return matches.value
  return matches.value.filter(
    (match) =>
      normalizeIngredient(match.recipe.name).includes(text) ||
      match.recipe.ingredients.some((ingredient) =>
        normalizeIngredient(ingredient.name).includes(text),
      ),
  )
})

let searchId = 0
async function search() {
  const id = ++searchId
  selected.value = null
  announcement.value = ''
  listMessage.value = ''
  if (!pantry.items.length) {
    matches.value = []
    hiddenCount.value = 0
    status.value = 'done'
    return
  }
  status.value = 'loading'
  const profile = profiles.activeProfile
  const expiringNames = pantry.items.filter(isExpiring).map((item) => item.name)
  try {
    const candidates = await findCandidates(
      pantry.items.map((item) => item.name),
      expiringNames,
    )
    const { recipes, rejected } = await loadRecipes(candidates, {
      accept: (recipe) => !violatesProfile(recipe, profile),
    })
    if (id !== searchId) return
    matches.value = rankMatches(
      recipes
        .map((recipe) => matchRecipe(recipe, pantry.items, expiringNames))
        .filter((match) => match.available.length),
    )
    hiddenCount.value = rejected
    status.value = 'done'
    announcement.value = `${matches.value.length} matching recipes found.`
  } catch (err) {
    if (id !== searchId) return
    error.value = err.message
    status.value = 'error'
  }
}

// Switching profile changes the dietary rules, so the results are refreshed.
watch(
  () => profiles.activeProfileId,
  () => {
    if (status.value !== 'idle') search()
  },
)

function closeDetail() {
  selected.value = null
  listMessage.value = ''
}
</script>
