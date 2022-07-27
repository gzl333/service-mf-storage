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
        // path: 'bucket',
        path: 'bucket/:serviceId?',
        component: () => import('pages/bucket/BucketList.vue'),
        meta: {
          title: '存储桶-' + siteTitle,
          title_en: 'Bucket-' + siteTitle_en
        },
        props: true // 组件直接接收url中的params，无需用$route对象承接
      },
      {
        // path: 'bucket/file',
        path: 'bucket/file/:serviceId?',
        component: () => import('pages/bucket/PathList.vue'),
        meta: {
          title: '存储桶-' + siteTitle,
          title_en: 'Bucket-' + siteTitle_en
        },
        props: true
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
  {
    path: '/storage/share/:serviceId?',
    component: () => import('pages/bucket/SharePathList.vue'),
    meta: {
      title: '分享文件-' + siteTitle,
      title_en: 'Shared Files-' + siteTitle_en
    },
    props: true
  },
  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
