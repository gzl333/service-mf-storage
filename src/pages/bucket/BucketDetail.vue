<script setup lang="ts">
import { /* ref, */ computed, watch } from 'vue'
import { navigateToUrl } from 'single-spa'
import { useStore } from 'stores/store'
import { useRoute/* , useRouter */ } from 'vue-router'
// import { i18n } from 'boot/i18n'

import PathTable from 'components/bucket/PathTable.vue'

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
  },
  tab: {
    type: String,
    required: false
  }
})
// const emits = defineEmits(['change', 'delete'])

const store = useStore()
const route = useRoute()
// const router = useRouter()
// const tc = i18n.global.tc

const tab = computed(() => store.items.currentPath[4])

// 如果没传tab，则跳转到tab=object
if (!store.items.currentPath[4]) {
  navigateToUrl(route.path.endsWith('/') ? route.path + 'object' : route.path + '/object')
}

const currentService = computed(() => store.tables.serviceTable.byId[props.serviceId])
const currentBucket = computed(() => store.tables.bucketTable.byLocalId[props.bucketName])

/* add path table */
// setup时调用一次
if (currentService.value?.endpoint_url) {
  void store.addPathTable({
    serviceId: props.serviceId,
    bucket: props.bucketName,
    path: route.query.path as string
  })
}

// 刷新页面时，等待有效的service信息，再调用
const unwatch = watch(currentService, () => {
  if (currentService.value?.endpoint_url) {
    // serviceTable已经加载，可以发送请求
    void store.addPathTable({
      serviceId: props.serviceId,
      bucket: props.bucketName,
      path: route.query.path as string
    })
    // watcher已完成任务，注销
    unwatch()
  }
})
/* add path table */

const path = route.query.path as string
const currentPath = computed(() => store.tables.pathTable.byLocalId[props.serviceId + '/' + props.bucketName + (path ? ('/' + path) : '')])

</script>

<template>
  <div class="BucketDetail">

    <div class="row items-center">
      <div class="text-h5 text-weight-bold">{{ currentBucket?.name }}</div>
    </div>

    <q-tabs
      :model-value="tab"
      active-color="primary"
      align="left"
      no-caps
      inline-label
    >
      <q-tab name="object"
             @click="navigateToUrl('/my/storage/service/' + props.serviceId + '/bucket/' + props.bucketName + '/object')">
        Object
      </q-tab>
      <q-tab name="property"
             @click="navigateToUrl('/my/storage/service/' + props.serviceId + '/bucket/' + props.bucketName + '/property')">
        Property
      </q-tab>
      <q-tab name="connection"
             @click="navigateToUrl('/my/storage/service/' + props.serviceId + '/bucket/' + props.bucketName + '/connection')">
        Connection
      </q-tab>
    </q-tabs>

    <q-separator/>

    <q-tab-panels :model-value="tab" animated>

      <q-tab-panel
        name="object"
        class="q-py-md q-px-none"
      >
        <PathTable :pathObj="currentPath"/>
      </q-tab-panel>

      <q-tab-panel name="property">
        Bucket Properties
      </q-tab-panel>

      <q-tab-panel name="connection">
        Connection Info
      </q-tab-panel>
    </q-tab-panels>

  </div>
</template>

<style lang="scss" scoped>
.BucketDetail {
}
</style>
