import { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/my/storage',
    component: () => import('layouts/StorageLayout.vue'),
    redirect: '/my/storage/bucket',
    children: [
      {
        // path: 'bucket',
        path: 'bucket/:serviceId?',
        component: () => import('pages/bucket/BucketList.vue'),

        props: true // 组件直接接收url中的params，无需用$route对象承接
      },
      {
        // path: 'bucket/file',
        path: 'bucket/file/:serviceId?',
        component: () => import('pages/bucket/PathList.vue'),
        props: true
      },
      {
        path: 'bucket/search',
        component: () => import('pages/bucket/SearchList.vue')
      },
      {
        path: 'instructions',
        component: () => import('pages/Instructions.vue')
      }
    ]
  },
  {
    path: '/storage',
    component: () => import('layouts/StorageShareLayout.vue'),
    beforeEnter: (to, form, next) => {
      const right = (JSON.stringify(to.query) === '{}')
      if (!right) {
        next()
      } else {
        next({ path: '/' })
      }
    },
    children: [
      {
        path: 'share/:serviceId?',
        component: () => import('pages/bucket/SharePathList.vue'),
        props: true
      },
      {
        path: 'share/down/:serviceId?/:bucket+',
        component: () => import('pages/bucket/ShareDown.vue'),
        props: true
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
