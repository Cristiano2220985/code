import { createRouter, createWebHistory } from 'vue-router'
import { useProfilesStore } from '@/stores/profiles'

const routes = [
  {
    path: '/',
    name: 'welcome',
    component: () => import('../pages/WelcomePage.vue'),
  },
  {
    path: '/onboarding',
    name: 'onboarding',
    component: () => import('../pages/OnboardingPage.vue'),
  },
  {
    path: '/pantry',
    name: 'pantry',
    component: () => import('../pages/PantryPage.vue'),
    meta: { requiresProfile: true },
  },
  {
    path: '/recipes',
    name: 'recipes',
    component: () => import('../pages/RecipesPage.vue'),
    meta: { requiresProfile: true },
  },
  {
    path: '/book',
    name: 'book',
    component: () => import('../pages/RecipeBookPage.vue'),
    meta: { requiresProfile: true },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: { name: 'welcome' },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// The main app is only available after a household profile has been created.
router.beforeEach((to) => {
  const store = useProfilesStore()

  if (to.meta.requiresProfile && !store.activeProfile) {
    return { name: 'welcome' }
  }
})

export default router
