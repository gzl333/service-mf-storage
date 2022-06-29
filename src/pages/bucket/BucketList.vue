<script lang="ts" setup>
import { computed } from 'vue'
// import { navigateToUrl } from 'single-spa'
import { useStore } from 'stores/store'
// import { useRoute, useRouter } from 'vue-router'
// import { i18n } from 'boot/i18n'
import BucketTable from 'components/bucket/BucketTable.vue'
import { BucketInterface } from 'src/stores/store'
// const props = defineProps({
//   foo: {
//     type: String,
//     required: false,
//     default: ''
//   }
// })
// const emits = defineEmits(['change', 'delete'])

const store = useStore()
// const route = useRoute()
// const router = useRouter()
// const tc = i18n.global.tc

void store.loadBucketTable()
const buckets = computed<BucketInterface[]>(() => Object.values(store.tables.bucketTable.byLocalId).sort((a: BucketInterface, b: BucketInterface) => a.name.localeCompare(b.name, 'en')))
console.log(store.items)
console.log(store.tables)
</script>

<template>
  <div class="BucketList">
    <div></div>
    <BucketTable :buckets="buckets"/>
  </div>
</template>

<style lang="scss" scoped>
.BucketList {
}
</style>
