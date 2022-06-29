import { RouteRecordRaw } from 'vue-router'
// 每个部署站点的统一名称后缀
const siteTitle = '中国科技云对象存储'
const siteTitle_en = 'CSTCloud Object Storage'
const routes: RouteRecordRaw[] = [
  {
    path: '/my/storage',
    component: () => import('layouts/StorageLayout.vue'),
    redirect: '/my/storage/bucket',
    children: [
      {
        path: 'bucket',
        component: () => import('pages/bucket/BucketList.vue'),
        meta: {
          title: '存储桶-' + siteTitle,
          title_en: 'Bucket-' + siteTitle_en
        }
      },
      {
        path: 'bucket/file',
        component: () => import('pages/bucket/PathList.vue'),
        meta: {
          title: '存储桶-' + siteTitle,
          title_en: 'Bucket-' + siteTitle_en
        },
        props: true // 接收url中的参数
      },
      {
        path: 'instructions',
        component: () => import('pages/Instructions.vue'),
        meta: {
          title: 'FTP-' + siteTitle,
          title_en: 'FTP-' + siteTitle_en
        }
      },
      {
        path: 'share/s/:dirPath+',
        component: () => import('pages/bucket/ShareList.vue'),
        meta: {
          requireLogin: false,
          isShare: ''
        },
        props: true
      },
      {
        path: 'share/s/confirm',
        component: () => import('pages/bucket/ShareConfirm.vue'),
        meta: {
          requireLogin: false,
          isShare: ''
        },
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
