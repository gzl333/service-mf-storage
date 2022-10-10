<script setup lang="ts">
// import { onBeforeMount, ref } from 'vue'
// import { navigateToUrl } from 'single-spa'
// import { useStore } from 'stores/store'
// import { useRoute } from 'vue-router'
// import storage from 'src/api/index'
// import { i18n } from 'boot/i18n'

// const props = defineProps({
//   foo: {
//     type: String,
//     required: false,
//     default: ''
//   }
// })
// const emits = defineEmits(['change', 'delete'])

// const store = useStore()
// const route = useRoute()
// const router = useRouter()
// const tc = i18n.global.tc
// const bucketName = route.params.bucket[0] as string
// const fileName = route.params.bucket[1] as string
// const downloadUrl = ref('')
// onBeforeMount(async () => {
// const respShareDir = await storage.storage.api.getPath({
//   path: {
//     bucket_name: bucketName,
//     path: fileName
//   }
// })
// downloadUrl.value = respShareDir.data.share_uri
// window.location.assign(downloadUrl.value)
// })
</script>

<template>
  <div>
    <!--  <a :href="downloadUrl"></a>-->
  </div>
</template>

<style lang="scss" scoped>
.ShareDown {
}
</style>
