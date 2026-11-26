<!-- US-8: chooses the collection that receives a saved recipe. -->
<template>
  <BaseDialog title="Add to collection" @close="$emit('close')">
    <p class="mt-1.5 text-xs text-muted">
      Organize <b class="font-semibold text-ink">{{ recipe.name }}</b> in your recipe book.
    </p>

    <template v-if="book.collections.length">
      <p id="collection-picker-label" class="mt-5 px-1 text-xs font-medium text-ink-soft">
        Choose a collection
      </p>
      <ul
        data-testid="recipe-book-collection-picker"
        aria-labelledby="collection-picker-label"
        class="mt-2 max-h-64 space-y-2 overflow-y-auto p-0.5"
      >
        <li v-for="collection in book.collections" :key="collection.id">
          <button
            type="button"
            data-testid="recipe-book-collection-option"
            :data-collection-name="collection.name"
            :disabled="includes(collection)"
            class="card pressable flex w-full items-center gap-3.5 rounded-[22px] bg-surface p-2.5 pr-4 text-left disabled:cursor-not-allowed disabled:opacity-55"
            @click="add(collection)"
          >
            <span
              class="flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] bg-tile"
              aria-hidden="true"
              ><AppIcon name="book" class="h-5 w-5"
            /></span>
            <span class="min-w-0 flex-1">
              <span class="block text-[15px] font-semibold tracking-tight">{{
                collection.name
              }}</span>
              <span class="mt-0.5 block text-xs text-muted">{{
                countLabel(collection.recipeIds.length, 'recipe')
              }}</span>
            </span>
            <span v-if="includes(collection)" class="text-xs text-muted">Already added</span>
          </button>
        </li>
      </ul>
      <p class="mt-3 rounded-[18px] bg-tile p-3 text-xs text-muted">
        The recipe will remain in All saved recipes and may also be included in other collections.
      </p>
    </template>
    <p v-else class="mt-4 rounded-[18px] bg-tile p-3 text-xs text-muted">
      You have no collections yet. Create one to organize your saved recipes.
    </p>

    <p v-if="error" role="alert" class="mt-3 px-1 text-xs font-semibold text-status-today">
      {{ error }}
    </p>

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
import AppIcon from '@/components/ui/AppIcon.vue'
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
