<!--
  US-19: recipe discovery. Recipes come from TheMealDB and are matched against the pantry:
  overlap percentage, expiring items first, and the active profile's restrictions applied.
-->
<template>
  <DashboardLayout>
    <div data-testid="recipe-discovery-screen" class="mt-4 md:mt-2">
      <p class="text-sm text-muted">From what you already have</p>
      <h1 class="mt-1 text-[40px] leading-[1.02] font-semibold tracking-[-0.045em] md:text-5xl">
        Discover <em class="font-medium text-ink-soft">recipes</em>
      </h1>
      <p class="mt-2 text-sm text-muted">
        Find meals you can prepare with the ingredients you already have.
      </p>

      <form class="mt-5" novalidate @submit.prevent="search">
        <label for="recipes-query" class="sr-only">Search by recipe or ingredient</label>
        <div class="card flex items-center gap-2 rounded-full bg-surface p-1.5 pl-4">
          <AppIcon name="search" class="h-5 w-5 text-muted" />
          <input
            id="recipes-query"
            v-model="query"
            type="search"
            autocomplete="off"
            placeholder="Search by recipe or ingredient..."
            class="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none placeholder:text-muted"
          />
          <BaseButton
            type="submit"
            data-testid="recipes-search-button"
            class="!px-4 !py-2.5"
            :disabled="status === 'loading'"
          >
            Search Recipes
          </BaseButton>
        </div>
        <div
          class="mt-2.5 flex flex-col gap-1 px-1 text-xs text-muted sm:flex-row sm:justify-between"
        >
          <span>Expiring ingredients first, then best pantry match</span>
          <span
            >Based on your active household profile:
            <b class="font-semibold text-ink">{{ profiles.activeProfile?.name }}</b></span
          >
        </div>
      </form>

      <section
        class="card mt-5 rounded-[26px] bg-surface p-4"
        aria-labelledby="recipes-pantry-title"
      >
        <h2 id="recipes-pantry-title" class="text-sm font-semibold">
          Available in your pantry
          <span class="font-normal text-muted">({{ pantry.items.length }})</span>
        </h2>
        <p v-if="!pantry.items.length" class="mt-1 text-xs text-muted">
          Your pantry is empty. Add items to find recipes that use them.
        </p>
        <ul v-else class="mt-3 flex flex-wrap gap-1.5">
          <li
            v-for="item in pantry.items"
            :key="item.id"
            class="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs"
            :class="isExpiring(item) ? 'bg-lime font-semibold text-lime-ink' : 'bg-tile'"
          >
            {{ item.name }}
            <span class="font-normal opacity-60">{{ quantityLabel(item) }}</span>
            <span v-if="isExpiring(item)" class="font-normal opacity-75">
              · expires {{ expirationLabel(item.expirationDate, today).toLowerCase() }}</span
            >
          </li>
        </ul>
      </section>

      <p role="status" class="sr-only">{{ announcement }}</p>

      <section
        v-if="status === 'idle'"
        class="mt-5 rounded-[26px] border border-dashed border-hairline px-5 py-10 text-center"
      >
        <span
          class="card mx-auto flex h-14 w-14 items-center justify-center rounded-[20px] bg-surface"
        >
          <AppIcon name="recipes" class="h-6 w-6" />
        </span>
        <p class="mt-4 font-semibold">Find meals with what you have</p>
        <p class="mt-1 text-xs text-muted">
          Tap Search Recipes to match recipes to the {{ pantry.items.length }} ingredients in your
          pantry.
        </p>
      </section>
      <p v-else-if="status === 'loading'" class="mt-6 text-sm text-muted">Searching recipes…</p>
      <p v-else-if="status === 'error'" class="mt-5 rounded-[22px] bg-surface p-4 text-sm">
        {{ error }} Check your connection and try again.
      </p>

      <section
        v-else
        class="mt-7"
        data-testid="recipes-search-results"
        aria-labelledby="recipes-results-title"
      >
        <h2 id="recipes-results-title" class="text-xl font-semibold tracking-tight">
          Matching recipes
          <span class="font-normal text-muted">({{ visibleMatches.length }})</span>
        </h2>
        <p class="text-xs text-muted">Results are matched to the current pantry.</p>
        <p
          v-if="listMessage && !selected"
          role="status"
          class="mt-3 rounded-full bg-ink px-4 py-2.5 text-xs font-medium text-white"
        >
          {{ listMessage }}
        </p>
        <p
          v-if="hiddenCount"
          class="mt-3 rounded-full bg-surface px-4 py-2.5 text-xs text-ink-soft"
        >
          Recipes that do not match the {{ profiles.activeProfile?.name }} profile are hidden.
        </p>
        <p v-if="!visibleMatches.length" class="mt-4 text-sm text-muted">
          {{
            pantry.items.length
              ? 'No recipes found for your pantry.'
              : 'Add items to your pantry to find recipes.'
          }}
        </p>
        <div class="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
import AppIcon from '@/components/ui/AppIcon.vue'
import RecipeCard from '@/components/recipes/RecipeCard.vue'
import RecipeDetailPanel from '@/components/recipes/RecipeDetailPanel.vue'
import { usePantryStore } from '@/stores/pantry'
import { useProfilesStore } from '@/stores/profiles'
import { useShoppingListStore } from '@/stores/shoppingList'
import { findCandidates, loadRecipes } from '@/services/recipes'
import { daysUntilExpiration, expirationLabel, UNIT_LABELS } from '@/utils/pantry'
import { matchRecipe, normalizeIngredient, rankMatches, violatesProfile } from '@/utils/recipes'

const pantry = usePantryStore()
const profiles = useProfilesStore()
const shoppingList = useShoppingListStore()

const today = new Date()
const status = ref('idle'),
  error = ref(''),
  matches = ref([]),
  hiddenCount = ref(0),
  query = ref(''),
  selected = ref(null),
  announcement = ref(''),
  listMessage = ref('')

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

function addMissing(match) {
  let added = 0
  for (const ingredient of match.missing) {
    try {
      shoppingList.addItem(ingredient.name)
      added++
    } catch {
      // Already on the shopping list.
    }
  }
  const skipped = match.missing.length - added
  listMessage.value = added
    ? `${added} ${added === 1 ? 'ingredient' : 'ingredients'} added to the shopping list${skipped ? ` (${skipped} already there)` : ''}.`
    : 'These ingredients are already on the shopping list.'
}

function closeDetail() {
  selected.value = null
  listMessage.value = ''
}
</script>
