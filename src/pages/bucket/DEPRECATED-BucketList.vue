<script lang="ts" setup>
import { computed/* , watch */ } from 'vue'
// import { navigateToUrl } from 'single-spa'
import { useStore } from 'stores/store'
// import { useRoute/* , useRouter */ } from 'vue-router'
// import { i18n } from 'boot/i18n'
// import api from 'src/api/index'

import { BucketInterface } from 'src/stores/store'
import BucketTable from 'components/bucket/BucketTable.vue'

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

// 传了serviceId，则正常显示
const currentService = computed(() => store.tables.serviceTable.byId[props.serviceId])

const buckets = computed<BucketInterface[]>(() =>
  Object.values(store.tables.bucketTable.byLocalId)
    .filter((bucket: BucketInterface) => bucket?.service_id === currentService.value?.id)
    .sort((a: BucketInterface, b: BucketInterface) => a.name.localeCompare(b.name, 'en'))
)

</script>

<template>
  <div class="BucketList">

    <BucketTable :serviceId="currentService?.id" :buckets="buckets"/>

  </div>
</template>

<style lang="scss" scoped>
.BucketList {
}
</style>
