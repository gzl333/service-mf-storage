import { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/my/storage',
    component: () => import('layouts/StorageLayout.vue'),
    redirect: '/my/storage/bucket/all',
    children: [
      {
        path: 'bucket/all',
        component: () => import('pages/bucket/BucketList.vue')
      },
      {
        path: 'bucket/:bucketId/:tabId?', // 加了:为参数，传进去由页面处理；未加为path，由路由处理
        component: () => import('pages/bucket/BucketDetail.vue'),
        props: true
      },
      {
        path: 'voucher',
        component: () => import('pages/coupon/CouponList.vue')
      },
      {
        path: 'search',
        component: () => import('pages/bucket/IntegratedSearch.vue')
      },
      {
        path: 'security',
        component: () => import('pages/bucket/SecurityCredential.vue')
      },
      {
        path: 'backup',
        component: () => import('pages/backup/BucketBackup.vue')
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
