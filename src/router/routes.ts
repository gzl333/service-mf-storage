import { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/my/storage',
    component: () => import('layouts/StorageLayout.vue'),
    redirect: '/my/storage/service',
    children: [
      {
        path: 'service',
        component: () => import('pages/service/ServiceRoot.vue'),
        props: true,
        children: [
          {
            path: ':serviceId',
            component: () => import('pages/bucket/BucketList.vue'),
            props: true // 组件直接接收url中的params，无需用$route对象承接
          },
          {
            path: ':serviceId?/bucket/:bucketName/:tabId?', // 加了:为参数，传进去由页面处理；未加为path，由路由处理
            component: () => import('pages/bucket/BucketDetail.vue'),
            props: true
          }
        ]
      },
      // {
      //   path: 'service/:serviceId?',
      //   component: () => import('pages/bucket/BucketList.vue'),
      //   props: true // 组件直接接收url中的params，无需用$route对象承接
      // },
      // {
      //   path: 'service/:serviceId?/bucket/:bucketName/:tab?',
      //   component: () => import('pages/bucket/BucketDetail.vue'),
      //   props: true
      // },
      // {
      //   path: 'service/:serviceId?/bucket/:bucketName',
      //   component: () => import('pages/bucket/PathList.vue'),
      //   props: true
      // },
      {
        path: 'search',
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
