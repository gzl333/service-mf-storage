<script setup lang="ts">
// import { ref, computed } from "vue"
// import { navigateToUrl } from 'single-spa'
// import { useStore } from 'stores/store'
import { useRoute/* , useRouter */ } from 'vue-router'
// import { i18n } from 'boot/i18n'

const props = defineProps({
  serviceId: {
    type: String,
    required: false,
    default: ''
  }
})
// const emits = defineEmits(['change', 'delete'])
console.log(props.serviceId)
// const store = useStore()
const route = useRoute()
// const router = useRouter()
// const tc = i18n.global.tc

// 接收url结构： siteURL/(serviceId/)?base=xxx&sub=xxx&p=xxx
const shareBase = route.query.base as string // string or undefined
const subPath = route.query.sub as string
const password = route.query.p as string
</script>

<template>
  <div class="SharePathList">
    <div>serviceId: {{ serviceId }}</div>
    <div>shareBase: {{ shareBase }}</div>
    <div>subPath: {{ subPath }}</div>
    <div>password: {{ password }}</div>
  </div>
</template>

<style lang="scss" scoped>
.SharePathList {
}
</style>
