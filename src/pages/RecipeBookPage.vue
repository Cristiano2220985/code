<!--
  US-8: Recipe Book. Saved recipes stay available offline and can be opened again with
  their current pantry match. Collections group saved recipes.
-->
<template>
  <DashboardLayout>
    <div data-testid="book-view" class="mt-4 md:mt-2">
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 class="text-[40px] leading-[1.02] font-semibold tracking-[-0.045em] md:text-5xl">
            My <em class="font-medium text-ink-soft">Recipe Book</em>
          </h1>
          <p class="mt-2 text-sm text-muted">
            Save, organize and revisit recipes whenever you need them.
          </p>
        </div>
        <BaseButton
          class="shrink-0"
          data-testid="recipe-book-create-collection-button"
          @click="creating = true"
        >
          + New collection
        </BaseButton>
      </div>

      <div class="mt-5 grid grid-cols-2 gap-2.5 sm:max-w-sm">
        <div v-for="stat in stats" :key="stat.label" class="card rounded-[24px] bg-surface p-4">
          <p class="text-[30px] leading-none font-semibold tracking-[-0.04em]">
            {{ stat.value }}
          </p>
          <p class="mt-1.5 text-xs text-muted">{{ stat.label }}</p>
        </div>
      </div>

      <div
        class="-mr-5 my-5 flex gap-2 overflow-x-auto pr-5 pb-1 [scrollbar-width:none]"
        role="group"
        aria-label="Recipe Book sections"
      >
        <button
          type="button"
          :aria-pressed="!activeCollection"
          :class="tabClass(!activeCollection)"
          @click="showSection(null)"
        >
          All saved recipes
          <span class="text-xs opacity-70">{{ book.recipes.length }}</span>
        </button>
        <button
          v-for="collection in book.collections"
          :key="collection.id"
          type="button"
          data-testid="recipe-book-collection-card"
          :data-collection-name="collection.name"
          :aria-pressed="activeCollectionId === collection.id"
          :class="tabClass(activeCollectionId === collection.id)"
          @click="showSection(collection.id)"
        >
          <span data-testid="recipe-book-collection-name">{{ collection.name }}</span>
          <span class="text-xs opacity-70">{{ collection.recipeIds.length }}</span>
        </button>
      </div>

      <p
        v-if="statusMessage"
        role="status"
        class="rounded-full bg-ink px-4 py-2.5 text-xs font-medium text-white"
      >
        {{ statusMessage }}
      </p>

      <section
        v-if="activeCollection"
        class="mt-6"
        data-testid="recipe-book-collection-detail-screen"
        :data-collection-name="activeCollection.name"
        aria-labelledby="book-collection-title"
      >
        <button
          type="button"
          class="pressable card rounded-full bg-surface px-3.5 py-2 text-xs font-medium text-ink-soft hover:text-ink"
          @click="showSection(null)"
        >
          ← All saved recipes
        </button>
        <h2 id="book-collection-title" class="mt-4 text-xl font-semibold tracking-tight">
          {{ activeCollection.name }}
        </h2>
        <p class="text-xs text-muted">
          {{ countLabel(activeCollection.recipeIds.length, 'recipe') }} in this collection
        </p>
        <EmptyState
          v-if="!collectionRecipes.length"
          title="This collection is empty"
          :text="`Add saved recipes to ${activeCollection.name}, or explore new dishes to save for later.`"
        />
        <ul
          data-testid="recipe-book-collection-recipes-list"
          class="mt-4 grid gap-4 md:grid-cols-2"
        >
          <li v-for="recipe in collectionRecipes" :key="recipe.id">
            <BookRecipeCard :recipe="recipe" note="In this collection" @open="openRecipe">
              <template #actions>
                <button
                  type="button"
                  data-testid="recipe-book-remove-from-collection-button"
                  class="pressable rounded-full bg-tile px-3.5 py-2 font-medium text-ink hover:bg-hairline"
                  @click="removeFromCollection(recipe)"
                >
                  ✕ Remove
                </button>
              </template>
            </BookRecipeCard>
          </li>
        </ul>
        <p
          v-if="collectionRecipes.length"
          class="mt-4 rounded-[18px] bg-tile px-3.5 py-2.5 text-xs text-muted"
        >
          ⓘ Removing a recipe from a collection does not delete it from All saved recipes.
        </p>
      </section>

      <section v-else class="mt-6" aria-labelledby="book-saved-title">
        <h2 id="book-saved-title" class="text-xl font-semibold tracking-tight">
          All saved recipes
        </h2>
        <p class="text-xs text-muted">Quick access to your favorite dishes.</p>

        <template v-if="book.recipes.length">
          <label for="book-search" class="sr-only">Search saved recipes</label>
          <div
            class="card mt-3 flex items-center gap-2 rounded-full bg-surface px-4 focus-within:ring-2 focus-within:ring-ink"
          >
            <AppIcon name="search" class="h-5 w-5 shrink-0 text-muted" />
            <input
              id="book-search"
              v-model="query"
              type="search"
              autocomplete="off"
              placeholder="Search saved recipes..."
              class="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-muted"
            />
          </div>
          <p v-if="!visibleRecipes.length" class="mt-4 text-sm text-muted">
            No saved recipes match "{{ query.trim() }}".
          </p>
        </template>
        <EmptyState
          v-else
          title="No saved recipes yet"
          text="Discover something delicious and save the recipes you want to try again."
        />

        <ul data-testid="recipe-book-saved-recipes-list" class="mt-4 grid gap-4 md:grid-cols-2">
          <li v-for="recipe in visibleRecipes" :key="recipe.id">
            <BookRecipeCard :recipe="recipe" @open="openRecipe">
              <template #actions>
                <button
                  type="button"
                  data-testid="recipe-book-add-to-collection-button"
                  class="pressable rounded-full bg-tile px-3.5 py-2 font-medium text-ink hover:bg-hairline"
                  @click="adding = recipe"
                >
                  + Add to collection
                </button>
              </template>
            </BookRecipeCard>
          </li>
        </ul>
      </section>
    </div>

    <AddToCollectionDialog
      v-if="adding"
      :recipe="adding"
      @close="adding = null"
      @added="onAdded"
      @create="createFromPicker"
    />
    <CreateCollectionDialog v-if="creating" @close="creating = false" @created="openCollection" />
    <RecipeDetailPanel
      v-if="selected"
      :match="selected"
      :message="listMessage"
      @close="closeRecipe"
      @add-missing="addMissing"
    />
  </DashboardLayout>
</template>

<script setup>
import { computed, ref } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import AddToCollectionDialog from '@/components/recipeBook/AddToCollectionDialog.vue'
import BookRecipeCard from '@/components/recipeBook/BookRecipeCard.vue'
import CreateCollectionDialog from '@/components/recipeBook/CreateCollectionDialog.vue'
import EmptyState from '@/components/recipeBook/EmptyState.vue'
import RecipeDetailPanel from '@/components/recipes/RecipeDetailPanel.vue'
import { useAddMissing } from '@/composables/useAddMissing'
import { usePantryStore } from '@/stores/pantry'
import { useRecipeBookStore } from '@/stores/recipeBook'
import { countLabel, filterRecipesByName, recipesInCollection } from '@/utils/recipeBook'
import { matchRecipe } from '@/utils/recipes'

const book = useRecipeBookStore()
const pantry = usePantryStore()
const { message: listMessage, addMissing } = useAddMissing()

const query = ref('')
const selected = ref(null)
const creating = ref(false)
const activeCollectionId = ref(null)
const adding = ref(null) // saved recipe being added to a collection
const statusMessage = ref('')

const visibleRecipes = computed(() => filterRecipesByName(book.recipes, query.value))
const activeCollection = computed(
  () => book.collections.find((collection) => collection.id === activeCollectionId.value) ?? null,
)
const collectionRecipes = computed(() =>
  activeCollection.value ? recipesInCollection(activeCollection.value, book.recipes) : [],
)
const stats = computed(() => [
  { label: 'Saved recipes', value: book.recipes.length },
  { label: 'Collections', value: book.collections.length },
])

const tabClass = (active) => [
  'pressable flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-sm',
  active ? 'bg-ink font-medium text-white' : 'card bg-surface text-ink-soft hover:text-ink',
]

// null shows All saved recipes; otherwise the collection with that id.
function showSection(collectionId) {
  activeCollectionId.value = collectionId
  statusMessage.value = ''
}

// A new collection is opened right away, as shown in the mockup.
function openCollection(collection) {
  creating.value = false
  showSection(collection.id)
}

// After adding, the collection is shown with the recipe inside it.
function onAdded(collection) {
  const recipeName = adding.value.name
  adding.value = null
  showSection(collection.id)
  statusMessage.value = `${recipeName} added to ${collection.name}.`
}

function removeFromCollection(recipe) {
  const collection = activeCollection.value
  book.removeFromCollection(collection.id, recipe.id)
  statusMessage.value = `${recipe.name} removed from ${collection.name}.`
}

function createFromPicker() {
  adding.value = null
  creating.value = true
}

// The details show the saved recipe compared with the pantry as it is now.
function openRecipe(recipe) {
  listMessage.value = ''
  selected.value = matchRecipe(recipe, pantry.items)
}

function closeRecipe() {
  selected.value = null
  listMessage.value = ''
}
</script>
