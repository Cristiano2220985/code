<!-- US-8: names a new collection in the Recipe Book. -->
<template>
  <BaseDialog
    title="Create collection"
    description="Give your collection a name to organize saved recipes."
    data-testid="recipe-book-create-collection-dialog"
    @close="$emit('close')"
  >
    <form class="mt-4" novalidate @submit.prevent="create">
      <label for="collection-name" class="text-xs font-semibold">Collection name</label>
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
        class="mt-1 w-full rounded-lg border px-3 py-2.5 outline-none focus:border-neutral-800 focus:ring-1 focus:ring-neutral-800"
        :class="error ? 'border-neutral-800' : 'border-neutral-300'"
      />
      <p
        id="collection-name-hint"
        class="mt-1 text-xs"
        :class="error ? 'font-semibold text-neutral-900' : 'text-neutral-500'"
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
