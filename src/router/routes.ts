import { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/my/storage',
    component: () => import('layouts/StorageLayout.vue'),
    redirect: '/my/storage/service1',
    children: [
      {
        path: 'service1',
        component: () => import('pages/Service1Page.vue')
      },
      {
        path: 'service2',
        component: () => import('pages/Service2Page.vue')
      }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
