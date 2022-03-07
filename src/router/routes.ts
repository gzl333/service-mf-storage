import { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/my/storage',
    component: () => import('layouts/StorageLayout.vue'),
    children: [{
      path: '',
      component: () => import('pages/StorageIndex.vue')
    },
    {
      path: 'create',
      component: () => import('pages/StorageCreate.vue')
    }]
  },
  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/Error404.vue')
  }
]

export default routes
