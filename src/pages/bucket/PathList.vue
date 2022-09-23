<script lang="ts" setup>
import { useStore } from 'stores/store'
import { useRoute } from 'vue-router'
import { computed, watch } from 'vue'
// import { navigateToUrl } from 'single-spa'
// import { i18n } from 'boot/i18n'

import PathTable from 'components/bucket/PathTable.vue'

const props = defineProps({
  serviceId: {
    type: String,
    required: true
  },
  bucketName: {
    type: String,
    required: true
  }
})
// const emit = defineEmits(['change', 'delete'])

// code starts...
// const { tc } = i18n.global
const store = useStore()
const route = useRoute()

// 传了serviceId，则正常显示
const currentService = computed(() => store.tables.serviceTable.byId[props.serviceId])

// setup时调用一次
if (currentService.value?.endpoint_url) {
  void store.addPathTable({
    serviceId: currentService.value?.id,
    bucket: props.bucketName,
    path: route.query.path as string
  })
}

// 刷新页面时，等待有效的service信息，再调用
const unwatch = watch(currentService, () => {
  if (currentService.value?.endpoint_url) {
    // serviceTable已经加载，可以发送请求
    void store.addPathTable({
      serviceId: currentService.value?.id,
      bucket: props.bucketName,
      path: route.query.path as string
    })
    // watcher已完成任务，注销
    unwatch()
  }
})

const path = route.query.path as string
const currentPath = computed(() => store.tables.pathTable.byLocalId[currentService.value?.id + '/' + props.bucketName + (path ? ('/' + path) : '')])

</script>

<template>
  <div class="PathList">
    <PathTable :pathObj="currentPath"/>
  </div>
</template>

<style lang="scss" scoped>
.PathList {
}
</style>
