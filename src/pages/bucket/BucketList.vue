<script lang="ts" setup>
import { computed, watch } from 'vue'
// import { navigateToUrl } from 'single-spa'
import { useStore } from 'stores/store'
// import { useRoute, useRouter } from 'vue-router'
import { i18n } from 'boot/i18n'
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

const { tc } = i18n.global
const store = useStore()
// const route = useRoute()
// const router = useRouter()

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
  void store.addBucketTable(currentService.value.endpoint_url, currentService.value.id)
}

// 刷新页面时，等待有效的service信息，再调用
const unwatch = watch(currentService, () => {
  if (currentService.value?.endpoint_url) {
    // serviceTable已经加载，可以load bucketTable
    void store.addBucketTable(currentService.value.endpoint_url, currentService.value.id)
    // watcher已完成任务，注销
    unwatch()
  }
})

const buckets = computed<BucketInterface[]>(() =>
  Object.values(store.tables.bucketTable.byLocalId)
    .filter((bucket: BucketInterface) => bucket?.service_id === currentService.value?.id)
    .sort((a: BucketInterface, b: BucketInterface) => a.name.localeCompare(b.name, 'en'))
)

</script>

<template>
  <div class="BucketList">
    <q-breadcrumbs class="row items-center text-black q-pb-md">
      <template v-slot:separator>
        <q-icon
          size="xs"
          name="chevron_right"
          color="grey"
        />
      </template>

      <q-breadcrumbs-el>
        <div class="row items-center no-wrap text-black">
          {{ i18n.global.locale === 'zh' ? currentService?.name : currentService?.name_en }}
        </div>
      </q-breadcrumbs-el>

      <q-breadcrumbs-el>
        <div class="row items-center no-wrap">
          <q-icon class="col-auto" size="xs" color="yellow-8" name="mdi-database"/>
          <div class="col-auto">{{ tc('全部存储桶') }}</div>
        </div>
      </q-breadcrumbs-el>

    </q-breadcrumbs>

    <BucketTable :serviceId="currentService?.id" :buckets="buckets"/>

  </div>
</template>

<style lang="scss" scoped>
.BucketList {
}
</style>
