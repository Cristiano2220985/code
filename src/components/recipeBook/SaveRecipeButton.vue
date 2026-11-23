<!-- US-8: saves a recipe to the Recipe Book (also reused by the GenAI Sous-Chef). -->
<template>
  <BaseButton
    data-testid="recipe-save-button"
    :data-saved="saved"
    :variant="saved ? 'secondary' : 'primary'"
    :disabled="saved"
    @click="book.saveRecipe(recipe)"
  >
    {{ saved ? '✓ Saved to Recipe Book' : 'Save Recipe' }}
  </BaseButton>
</template>

<script setup>
import { computed } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { useRecipeBookStore } from '@/stores/recipeBook'

const props = defineProps({
  recipe: { type: Object, required: true },
})

const book = useRecipeBookStore()
const saved = computed(() => book.isSaved(props.recipe.id))
</script>
