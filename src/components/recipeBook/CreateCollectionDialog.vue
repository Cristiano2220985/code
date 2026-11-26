<!-- US-8: names a new collection in the Recipe Book. -->
<template>
  <BaseDialog
    title="Create collection"
    description="Give your collection a name to organize saved recipes."
    data-testid="recipe-book-create-collection-dialog"
    @close="$emit('close')"
  >
    <form class="mt-5" novalidate @submit.prevent="create">
      <label for="collection-name" class="block px-1 text-xs font-medium text-ink-soft"
        >Collection name</label
      >
      <input
        id="collection-name"
        v-model="name"
        data-testid="recipe-book-collection-name-input"
        type="text"
        autocomplete="off"
        autofocus
        maxlength="40"
        :aria-invalid="Boolean(error)"
        aria-describedby="collection-name-hint"
        class="mt-1.5 h-12 w-full rounded-2xl bg-surface px-3.5 text-ink ring-1 outline-none placeholder:text-muted focus:ring-2 focus:ring-ink"
        :class="error ? 'ring-status-today' : 'ring-hairline'"
      />
      <p
        id="collection-name-hint"
        class="mt-1.5 px-1 text-xs"
        :class="error ? 'font-semibold text-status-today' : 'text-muted'"
        :role="error ? 'alert' : undefined"
      >
        {{ error || 'You can add recipes to this collection later.' }}
      </p>
      <div class="mt-5 flex justify-end gap-2">
        <BaseButton variant="secondary" @click="$emit('close')">Cancel</BaseButton>
        <BaseButton type="submit" data-testid="recipe-book-collection-create-button">
          + Create collection
        </BaseButton>
      </div>
    </form>
  </BaseDialog>
</template>

<script setup>
import { ref } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseDialog from '@/components/ui/BaseDialog.vue'
import { useRecipeBookStore } from '@/stores/recipeBook'

const emit = defineEmits(['close', 'created'])

const book = useRecipeBookStore()
const name = ref('')
const error = ref('')

function create() {
  try {
    emit('created', book.createCollection(name.value))
  } catch (err) {
    error.value = err.message
  }
}
</script>
