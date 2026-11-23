<!--
  US-8: Recipe Book. Saved recipes stay available offline and can be opened again with
  their current pantry match.
-->
<template>
  <DashboardLayout>
    <div data-testid="book-view">
      <h1 class="text-xl font-bold md:text-2xl">My Recipe Book</h1>
      <p class="mt-1 text-sm text-neutral-500">
        Save, organize and revisit recipes whenever you need them.
      </p>

      <div class="mt-5 grid grid-cols-2 gap-3 sm:max-w-sm">
        <div class="rounded-xl border border-neutral-300 p-3">
          <p class="text-lg font-bold">{{ book.recipes.length }}</p>
          <p class="text-xs text-neutral-500">Saved recipes</p>
        </div>
      </div>

      <section class="mt-6" aria-labelledby="book-saved-title">
        <h2 id="book-saved-title" class="font-semibold">All saved recipes</h2>
        <p class="text-xs text-neutral-500">Quick access to your favorite dishes.</p>

        <template v-if="book.recipes.length">
          <label for="book-search" class="sr-only">Search saved recipes</label>
          <input
            id="book-search"
            v-model="query"
            type="search"
            autocomplete="off"
            placeholder="Search saved recipes..."
            class="mt-3 w-full rounded-lg border border-neutral-300 px-3 py-2.5 outline-none focus:border-neutral-800 focus:ring-1 focus:ring-neutral-800"
          />
          <p v-if="!visibleRecipes.length" class="mt-4 text-sm text-neutral-500">
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
            <BookRecipeCard :recipe="recipe" @open="openRecipe" />
          </li>
        </ul>
      </section>
    </div>

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
import BookRecipeCard from '@/components/recipeBook/BookRecipeCard.vue'
import EmptyState from '@/components/recipeBook/EmptyState.vue'
import RecipeDetailPanel from '@/components/recipes/RecipeDetailPanel.vue'
import { useAddMissing } from '@/composables/useAddMissing'
import { usePantryStore } from '@/stores/pantry'
import { useRecipeBookStore } from '@/stores/recipeBook'
import { filterRecipesByName } from '@/utils/recipeBook'
import { matchRecipe } from '@/utils/recipes'

const book = useRecipeBookStore()
const pantry = usePantryStore()
const { message: listMessage, addMissing } = useAddMissing()

const query = ref('')
const selected = ref(null)

const visibleRecipes = computed(() => filterRecipesByName(book.recipes, query.value))

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
