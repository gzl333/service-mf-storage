<!--本页接受参数，确定目录位置，并生成files对象传给fileTable-->
<script lang="ts" setup>
import PathTable from 'components/bucket/PathTable.vue'
import { useStore } from 'stores/store'
import { useRoute } from 'vue-router'
import { computed } from 'vue'
// import { i18n } from 'boot/i18n'
// import { ref } from "vue"
// todo fileList 页面是一个万能页面，自动处理所有数据，根据url来判断怎么处理。数据流向： url参数 -> 本页面 -> fileTable

// const props = defineProps({
//   foo: {
//     type: String,
//     required: false,
//     default: ''
//   }
// })
// const emit = defineEmits(['change', 'delete'])

// code starts...
const store = useStore()
const route = useRoute()
// const tc = i18n.global.tc
// 获取url所传参数.
const bucket = route.query.bucket as string // string or undefined
const path = route.query.path as string
const fullPath = bucket + (path ? ('/' + path) : '')
void store.addPathTable({ bucket, path })
const pathObj = computed(() => store.tables.pathTable.byLocalId[fullPath])
</script>

<template>
  <div class="PathList">
    <PathTable :pathObj="pathObj"/>
  </div>
</template>

<style lang="scss" scoped>
.PathList {
}
</style>
