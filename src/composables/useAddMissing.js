import { ref } from 'vue'
import { useShoppingListStore } from '@/stores/shoppingList'

// Adds the missing ingredients of a recipe match to the shopping list (US-19, reused by US-8).
export function useAddMissing() {
  const shoppingList = useShoppingListStore()
  const message = ref('')

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
    message.value = added
      ? `${added} ${added === 1 ? 'ingredient' : 'ingredients'} added to the shopping list${skipped ? ` (${skipped} already there)` : ''}.`
      : 'These ingredients are already on the shopping list.'
  }

  return { message, addMissing }
}
