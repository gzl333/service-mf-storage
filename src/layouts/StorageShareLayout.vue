<script setup lang="ts">
// import { ref, computed } from "vue"
// import { navigateToUrl } from 'single-spa'
import { useStore } from 'stores/store'
// import { useRoute, useRouter } from 'vue-router'
// import { i18n } from 'boot/i18n'

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
// the root layout of @cnic/storage, load @cnic/storage's store here
console.log('@cnic/storage store:', store.$state)
void store.loadShareAllTables()

</script>

<template>
  <q-layout view="hHh LpR fFf">

    <q-page-container>
      <q-scroll-area style="height: calc(100vh - 60px)">
        <router-view class="q-pa-md" :key="$route.fullPath"/>
      </q-scroll-area>
    </q-page-container>

  </q-layout>
</template>

<style lang="scss" scoped>
</style>
