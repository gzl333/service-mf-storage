<script lang="ts" setup>
import { ref, onMounted, nextTick, computed } from 'vue'
import ShareTable from 'components/bucket/ShareTable.vue'
import { useRoute, useRouter } from 'vue-router'
import storage from 'src/api/index'

const $route = useRoute()
const $router = useRouter()
const isPass = ref(false)
const isRight = ref(false)
const tableRow = ref([])
let shareBase = ''
let password = ''
const message = ref('')

onMounted(async () => {
  try {
    shareBase = $route.path.slice(9)
    if ($route.query.p) {
      password = $route.query.p
      const dataDre = await storage.storage.api.getShareBase({ path: { share_base: shareBase }, query: { p: password } })
      tableRow.value = dataDre.data.files
      if (dataDre.data.code === 200) {
        await nextTick(() => {
          isRight.value = false
          isPass.value = true
        })
      }
    } else {
      const dataDre = await storage.storage.api.getShareBase({ path: { share_base: shareBase } })
      tableRow.value = dataDre.data.files
      if (dataDre.data.code === 200) {
        await nextTick(() => {
          isRight.value = false
          isPass.value = true
        })
      }
    }
  } catch (error) {
    if (error.response.data.code === 401) {
      void await $router.push({
        path: '/share/s/confirm',
        query: { path: shareBase }
      })
      await nextTick(() => {
        isPass.value = false
        isRight.value = false
      })
    } else if (error.response.data.code === 403) {
      message.value = '您没有访问权限'
      isPass.value = false
      isRight.value = true
    } else if (error.response.data.code === 404) {
      message.value = '分享根目录不存在'
      isPass.value = false
      isRight.value = true
    }
  }
})
const pathObj = computed(() => tableRow.value)
</script>

<template>
  <div v-if="isRight" class="q-pa-md row items-start q-gutter-md">
    <q-card flat bordered class="my-card bg-grey-1 q-pa-sm">
      <q-card-section>
        {{ message }}
      </q-card-section>
    </q-card>
  </div>
  <q-layout view="hHh LpR lfr" v-if="isPass">
    <q-header class="row items-center bg-white" style="height: 55px;box-shadow: 0px 5px 5px 1px #F4F4F4;">
      <q-toolbar>
        <q-toolbar-title class="row items-centers">
          <q-icon name="img:svg/title.svg" size="145px" style="width: 145px;height: 30px;"/>
          <span class="text-black text-bold text-h7">&nbsp; 中国科技云对象存储</span>
        </q-toolbar-title>
      </q-toolbar>
    </q-header>
    <q-page-container>
      <div class="q-pa-md">
        <ShareTable :pathObj="pathObj"/>
      </div>
    </q-page-container>
  </q-layout>
</template>
<style scoped>

</style>
