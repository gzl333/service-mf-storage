<script setup lang="ts">
import { /* ref, */ computed, watch /* , PropType */ } from 'vue'
// import { navigateToUrl } from 'single-spa'
import { useStore } from 'stores/store'
// import { useRoute, useRouter } from 'vue-router'
// import { i18n } from 'boot/i18n'

import GlobalBreadcrumbs from 'components/ui/GlobalBreadcrumbs.vue'

const props = defineProps({
  serviceId: {
    type: String,
    required: false,
    default: ''
  },
  bucketName: {
    type: String,
    required: false,
    default: ''
  }
})
// const emits = defineEmits(['change', 'delete'])

// const { tc } = i18n.global
const store = useStore()
// const route = useRoute()
// const router = useRouter()

// const currentPath = store.items.currentPath[1]

/* 本页面为service详情的根页面，负责：
* 1.未传serviceId时的路由守卫跳转
* 2.load bucketTable
* 3.显示面包屑导航 */

// // 如果没传serviceId，则跳转到第一个service
// if (!props.serviceId) {
//   const firstServiceId = computed(() => store.tables.serviceTable.allIds[0])
//   if (firstServiceId.value) {
//     navigateToUrl('/my/storage/service/' + firstServiceId.value)
//   }
//   watch(firstServiceId, () => {
//     if (firstServiceId.value) {
//       navigateToUrl('/my/storage/service/' + firstServiceId.value)
//     }
//   })
// }

const currentService = computed(() => store.tables.serviceTable.byId[props.serviceId])

/* load single bucket table */
// setup时调用一次
if (currentService.value?.endpoint_url) {
  void store.addBucketTable(currentService.value.id)
}

// 刷新页面时，等待有效的service信息，再调用
const unwatch = watch(currentService, () => {
  if (currentService.value?.endpoint_url) {
    // serviceTable已经加载，可以load bucketTable
    void store.addBucketTable(currentService.value.id)
    // watcher已完成任务，注销
    unwatch()
  }
})
/* load single bucket table */

// /* load all bucket table */
//
// // setup时调用一次
// if (store.tables.serviceTable.status === 'total') {
//   void store.addBucketTable(currentService.value.id)
// }
//
// // 刷新页面时，等待有效的service信息，再调用
// const unwatch = watch(currentService, () => {
//   if (currentService.value?.endpoint_url) {
//     // serviceTable已经加载，可以load bucketTable
//     void store.addBucketTable(currentService.value.id)
//     // watcher已完成任务，注销
//     unwatch()
//   }
// })
// /* load all bucket table */

</script>

<template>
  <div class="ServiceIndex">

    <div class="row items-center text-black q-pb-md">
      <GlobalBreadcrumbs/>
    </div>

    <router-view :key="$route.fullPath"/>

  </div>
</template>

<style lang="scss" scoped>
.ServiceIndex {
}
</style>
