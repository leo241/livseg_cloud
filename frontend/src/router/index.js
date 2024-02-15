import { createRouter, createWebHistory,createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  // history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/Index.vue')
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/About.vue')
    },
    {
      path: '/cardiac_workflow',
      name: 'cardiac_workflow',
      component: () => import('../views/CardiacWorkflow.vue')
    },
    {
      path: '/livseg',
      name: 'livseg',
      component: () => import('../views/LivSegMRI.vue')
    },
  ],
  // base: '/livseg2/' //为了保证正常路游,但好像meta.env.BASE_URL时一样的功能
})

export default router
