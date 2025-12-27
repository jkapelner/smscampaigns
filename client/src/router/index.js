import { createRouter, createWebHistory } from 'vue-router'
import store from '../store'

const routes = [
  {
    path: '/',
    redirect: '/campaigns'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/signup',
    name: 'Signup',
    component: () => import('../views/Signup.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/campaigns',
    name: 'Campaigns',
    component: () => import('../views/Campaigns.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/campaigns/:id',
    name: 'CampaignDetails',
    component: () => import('../views/CampaignDetails.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/campaigns/:id/stats',
    name: 'Statistics',
    component: () => import('../views/Statistics.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guards
router.beforeEach((to, from, next) => {
  const isAuthenticated = store.getters['auth/isAuthenticated']

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else if (to.meta.requiresGuest && isAuthenticated) {
    next('/campaigns')
  } else {
    next()
  }
})

export default router
