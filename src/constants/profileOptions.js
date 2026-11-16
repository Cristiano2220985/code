// Options available when configuring a household profile.

export const SERVINGS_MIN = 1;
export const SERVINGS_MAX = 20;
export const DEFAULT_SERVINGS = 2;

export const NO_RESTRICTIONS_LABEL = "No restrictions";

export const DIETARY_LIFESTYLES = [
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "pescatarian", label: "Pescatarian" },
  { value: "gluten-free", label: "Gluten-free" },
  { value: "lactose-free", label: "Lactose-free" },
];

export const FOOD_ALLERGENS = [
  { value: "gluten", label: "Gluten" },
  { value: "milk", label: "Milk" },
  { value: "eggs", label: "Eggs" },
  { value: "peanuts", label: "Peanuts" },
  { value: "tree-nuts", label: "Tree nuts" },
  { value: "shellfish", label: "Shellfish" },
  { value: "soy", label: "Soy" },
  { value: "fish", label: "Fish" },
];
