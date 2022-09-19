<script lang="ts" setup>
import { computed, watch } from 'vue'
// import { navigateToUrl } from 'single-spa'
import { useStore } from 'stores/store'
// import { useRoute, useRouter } from 'vue-router'
// import { i18n } from 'boot/i18n'
// import api from 'src/api/index'

import BucketTable from 'components/bucket/BucketTable.vue'
import { BucketInterface } from 'src/stores/store'
import { navigateToUrl } from 'single-spa'

const props = defineProps({
  serviceId: {
    type: String,
    required: false,
    default: ''
  }
})
// const emits = defineEmits(['change', 'delete'])

const store = useStore()
// const route = useRoute()
// const router = useRouter()
// const tc = i18n.global.tc

// console.log('serviceId:', props.serviceId)

// 如果没传serviceId，则跳转到第一个service
if (!props.serviceId) {
  const firstServiceId = computed(() => store.tables.serviceTable.allIds[0])
  if (firstServiceId.value) {
    navigateToUrl('/my/storage/service/' + firstServiceId.value)
  }
  watch(firstServiceId, () => {
    if (firstServiceId.value) {
      navigateToUrl('/my/storage/service/' + firstServiceId.value)
    }
  })
}
// 传了serviceId，则正常显示
const currentService = computed(() => store.tables.serviceTable.byId[props.serviceId])

// setup时调用一次
if (currentService.value?.endpoint_url) {
  void store.loadBucketTable(currentService.value.endpoint_url)
}

// 刷新页面时，等待有效的service信息，再调用
const unwatch = watch(currentService, () => {
  if (currentService.value?.endpoint_url) {
    // serviceTable已经加载，可以load bucketTable
    void store.loadBucketTable(currentService.value.endpoint_url)
    // watcher已完成任务，注销
    unwatch()
  }
})

const buckets = computed<BucketInterface[]>(() => Object.values(store.tables.bucketTable.byLocalId).sort((a: BucketInterface, b: BucketInterface) => a.name.localeCompare(b.name, 'en')))

</script>

<template>
  <div class="BucketList">
    <BucketTable :service="currentService" :buckets="buckets"/>
  </div>
</template>

<style lang="scss" scoped>
.BucketList {
}
</style>
