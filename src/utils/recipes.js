// US-19: pure helpers for recipe discovery (no Vue, no network).

// Singular, lower case and single spaces, so "Carrots" matches "carrot".
export function normalizeIngredient(name) {
  const words = String(name ?? '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (!words.length) return ''
  const last = words.at(-1)
  if (last.length > 3) {
    if (last.endsWith('ies')) words[words.length - 1] = last.slice(0, -3) + 'y'
    else if (last.endsWith('oes')) words[words.length - 1] = last.slice(0, -2)
    else if (last.endsWith('s') && !last.endsWith('ss')) words[words.length - 1] = last.slice(0, -1)
  }
  return words.join(' ')
}

export function sameIngredient(a, b) {
  const left = normalizeIngredient(a)
  return Boolean(left) && left === normalizeIngredient(b)
}

// Compares a recipe with the pantry: which ingredients are in stock and the overlap percentage.
export function matchRecipe(recipe, pantryItems, expiringNames = []) {
  const available = [],
    missing = []
  for (const ingredient of recipe.ingredients) {
    const pantryItem = pantryItems.find((item) => sameIngredient(item.name, ingredient.name))
    if (pantryItem) available.push({ ...ingredient, pantryItem })
    else missing.push(ingredient)
  }
  const total = recipe.ingredients.length
  const usesExpiring = available
    .filter((ingredient) => expiringNames.some((name) => sameIngredient(name, ingredient.name)))
    .map((ingredient) => ingredient.pantryItem.name)
  return {
    recipe,
    available,
    missing,
    total,
    overlap: total ? Math.round((available.length / total) * 100) : 0,
    usesExpiring,
  }
}

// Expiring ingredients first, then the best pantry match.
export function rankMatches(matches) {
  return [...matches].sort(
    (a, b) =>
      Number(b.usesExpiring.length > 0) - Number(a.usesExpiring.length > 0) ||
      b.overlap - a.overlap ||
      b.available.length - a.available.length ||
      a.recipe.name.localeCompare(b.recipe.name),
  )
}

// ---------- dietary rules ----------
// Ingredient names are matched word by word, so "butter" does not match "butternut squash".
const GROUPS = {
  meat: [
    'beef',
    'pork',
    'chicken',
    'lamb',
    'goat',
    'mutton',
    'veal',
    'duck',
    'turkey',
    'bacon',
    'ham',
    'sausage',
    'chorizo',
    'salami',
    'pepperoni',
    'prosciutto',
    'pancetta',
    'mince',
    'steak',
    'lard',
    'gelatin',
    'gelatine',
    'suet',
    'kidney',
    'liver',
    'oxtail',
    'venison',
    'rabbit',
    'goose',
    'meatball',
    'brisket',
    'rib',
  ],
  fish: [
    'fish',
    'salmon',
    'tuna',
    'cod',
    'haddock',
    'mackerel',
    'sardine',
    'pilchard',
    'anchovy',
    'trout',
    'herring',
    'sea bass',
    'tilapia',
    'monkfish',
    'halibut',
    'kipper',
  ],
  shellfish: [
    'prawn',
    'shrimp',
    'crab',
    'lobster',
    'mussel',
    'clam',
    'oyster',
    'scallop',
    'squid',
    'octopus',
    'crayfish',
    'langoustine',
    'cockle',
  ],
  milk: [
    'milk',
    'cream',
    'butter',
    'cheese',
    'parmesan',
    'mozzarella',
    'cheddar',
    'feta',
    'gruyère',
    'gruyere',
    'ricotta',
    'mascarpone',
    'yogurt',
    'yoghurt',
    'ghee',
    'crème fraîche',
    'creme fraiche',
    'paneer',
    'halloumi',
    'brie',
    'camembert',
    'stilton',
    'gouda',
    'custard',
    'buttermilk',
    'whey',
  ],
  eggs: ['egg', 'egg yolk', 'egg white', 'mayonnaise', 'meringue'],
  honey: ['honey'],
  gluten: [
    'flour',
    'bread',
    'breadcrumb',
    'pasta',
    'spaghetti',
    'fettuccine',
    'linguine',
    'penne',
    'macaroni',
    'lasagne',
    'lasagna',
    'noodle',
    'couscous',
    'barley',
    'wheat',
    'semolina',
    'bulgur',
    'pastry',
    'tortilla',
    'pita',
    'biscuit',
    'cracker',
    'rye',
    'soy sauce',
    'vermicelli',
    'pappardelle',
    'tagliatelle',
    'rigatoni',
    'paccheri',
  ],
  peanuts: ['peanut'],
  'tree-nuts': [
    'almond',
    'walnut',
    'cashew',
    'hazelnut',
    'pecan',
    'pistachio',
    'pine nut',
    'macadamia',
    'brazil nut',
    'chestnut',
  ],
  soy: ['soy', 'soya', 'tofu', 'edamame', 'miso', 'tempeh'],
}
// Plant-based or naturally gluten-free variants that would otherwise match a group.
const EXCEPTIONS = {
  milk: [
    'coconut',
    'almond',
    'soy',
    'soya',
    'oat',
    'rice milk',
    'vegan',
    'plant',
    'peanut butter',
    'cocoa butter',
    'butter bean',
    'cream of tartar',
    'ice cream soda',
  ],
  gluten: [
    'corn flour',
    'cornflour',
    'rice flour',
    'almond flour',
    'coconut flour',
    'gluten-free',
    'rice noodle',
    'chickpea flour',
    'buckwheat',
    'potato flour',
    'tapioca',
  ],
  eggs: ['eggplant'],
}

const LIFESTYLE_RULES = {
  vegetarian: ['meat', 'fish', 'shellfish'],
  vegan: ['meat', 'fish', 'shellfish', 'milk', 'eggs', 'honey'],
  pescatarian: ['meat'],
  'gluten-free': ['gluten'],
  'lactose-free': ['milk'],
}
// Profile allergen values -> ingredient groups
const ALLERGEN_RULES = {
  gluten: ['gluten'],
  milk: ['milk'],
  eggs: ['eggs'],
  peanuts: ['peanuts'],
  'tree-nuts': ['tree-nuts'],
  shellfish: ['shellfish'],
  soy: ['soy'],
  fish: ['fish'],
}

function containsTerm(name, term) {
  const text = ` ${normalizeIngredient(name)} `
  return text.includes(` ${normalizeIngredient(term)} `)
}

export function ingredientInGroup(name, group) {
  if ((EXCEPTIONS[group] ?? []).some((term) => containsTerm(name, term))) return false
  return GROUPS[group].some((term) => containsTerm(name, term))
}

export function isVeganRecipe(recipe) {
  return !recipe.ingredients.some((ingredient) =>
    LIFESTYLE_RULES.vegan.some((group) => ingredientInGroup(ingredient.name, group)),
  )
}

// True when the recipe breaks the profile's lifestyles, allergies or excluded ingredients.
export function violatesProfile(recipe, profile) {
  if (!profile) return false
  const groups = new Set([
    ...(profile.lifestyles ?? []).flatMap((value) => LIFESTYLE_RULES[value] ?? []),
    ...(profile.allergies ?? []).flatMap((value) => ALLERGEN_RULES[value] ?? []),
  ])
  const excluded = profile.excludedIngredients ?? []
  return recipe.ingredients.some(
    (ingredient) =>
      [...groups].some((group) => ingredientInGroup(ingredient.name, group)) ||
      excluded.some((term) => containsTerm(ingredient.name, term)),
  )
}
