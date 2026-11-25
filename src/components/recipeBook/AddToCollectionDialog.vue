<!-- US-8: chooses the collection that receives a saved recipe. -->
<template>
  <BaseDialog title="Add to collection" @close="$emit('close')">
    <p class="mt-1 text-xs text-neutral-500">
      Organize <b class="text-neutral-900">{{ recipe.name }}</b> in your recipe book.
    </p>

    <template v-if="book.collections.length">
      <p id="collection-picker-label" class="mt-4 text-xs font-semibold">Choose a collection</p>
      <ul
        data-testid="recipe-book-collection-picker"
        aria-labelledby="collection-picker-label"
        class="mt-2 max-h-64 space-y-2 overflow-y-auto"
      >
        <li v-for="collection in book.collections" :key="collection.id">
          <button
            type="button"
            data-testid="recipe-book-collection-option"
            :data-collection-name="collection.name"
            :disabled="includes(collection)"
            class="flex w-full items-center justify-between gap-3 rounded-lg border border-neutral-300 px-3 py-2.5 text-left hover:border-neutral-800 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:border-neutral-300"
            @click="add(collection)"
          >
            <span>
              <span class="block text-sm font-semibold">{{ collection.name }}</span>
              <span class="block text-xs text-neutral-500">{{
                countLabel(collection.recipeIds.length, 'recipe')
              }}</span>
            </span>
            <span v-if="includes(collection)" class="text-xs text-neutral-500">Already added</span>
          </button>
        </li>
      </ul>
      <p class="mt-3 rounded-lg bg-neutral-50 p-3 text-xs text-neutral-500">
        The recipe will remain in All saved recipes and may also be included in other collections.
      </p>
    </template>
    <p v-else class="mt-4 rounded-lg bg-neutral-50 p-3 text-xs text-neutral-500">
      You have no collections yet. Create one to organize your saved recipes.
    </p>

    <p v-if="error" role="alert" class="mt-3 text-xs font-semibold">{{ error }}</p>

    <div class="mt-5 flex justify-end gap-2">
      <BaseButton variant="secondary" @click="$emit('close')">Cancel</BaseButton>
      <BaseButton v-if="!book.collections.length" @click="$emit('create')">
        + Create collection
      </BaseButton>
    </div>
  </BaseDialog>
</template>

<script setup>
import { ref } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseDialog from '@/components/ui/BaseDialog.vue'
import { useRecipeBookStore } from '@/stores/recipeBook'
import { countLabel } from '@/utils/recipeBook'

const props = defineProps({
  recipe: { type: Object, required: true },
})
const emit = defineEmits(['close', 'added', 'create'])

const book = useRecipeBookStore()
const error = ref('')

const includes = (collection) => collection.recipeIds.includes(props.recipe.id)

// Choosing a collection adds the recipe straight away.
function add(collection) {
  try {
    emit('added', book.addToCollection(collection.id, props.recipe.id))
  } catch (err) {
    error.value = err.message
  }
}
</script>
