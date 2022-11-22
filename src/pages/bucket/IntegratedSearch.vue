<script setup lang="ts">
import { ref, computed, Ref, onBeforeUnmount, onBeforeMount } from 'vue'
import { useStore } from 'stores/store'
import { useRoute/* , useRouter */ } from 'vue-router'
import { navigateToUrl } from 'single-spa'
import { i18n } from 'boot/i18n'
import { Notify } from 'quasar'
import api from 'src/api'
import emitter from 'boot/mitt'
import SearchTable from 'components/bucket/SearchTable.vue'

// const props = defineProps({
//   foo: {
//     type: String,
//     required: false,
//     default: ''
//   }
// })
// const emits = defineEmits(['change', 'delete'])

// 获取所有服务选项
const searchOptions = computed(() => store.getIntegratedSearchOptions)
const store = useStore()
const { tc } = i18n.global
const route = useRoute()
// const router = useRouter()
// 选定默认值
const tabActive: Ref<string> = ref('')
const pathArr: Ref = ref([])
const selection: Ref<Array<string>> = ref([])
const keyword = ref('')
const bucketId = route.query.bucket as string
const defaultKeyword = route.query.keyword as string
const dynamicTab = (index: number) => {
  pathArr.value.splice(index, 1)
  tabActive.value = pathArr.value[0].tab.optionId
}
const getSearchDate = async () => {
  pathArr.value = []
  // let index = 0
  for (const argument of selection.value) {
    const dataObj = {
      // tab为对应的tab信息
      tab: {
        optionId: '',
        name: '',
        nameEn: '',
        bucketId: '',
        serviceId: ''
        // index: ''
      },
      // results为搜索数据
      results: []
    }
    const base = store.tables.serviceTable.byId[store.tables.bucketTable.byId[argument]?.service.id]?.endpoint_url
    const bucketName = store.tables.bucketTable.byId[argument]?.name
    const respGetBuckets = await api.storage.single.getSearchObject({
      base,
      query: {
        bucket: bucketName,
        search: keyword.value
      }
    })
    dataObj.tab.optionId = store.tables.bucketTable.byId[argument]?.service.id + '/' + store.tables.bucketTable.byId[argument]?.name
    dataObj.tab.name = store.tables.bucketTable.byId[argument]?.service.name + '/' + store.tables.bucketTable.byId[argument]?.name
    dataObj.tab.nameEn = store.tables.bucketTable.byId[argument]?.service.name_en + '/' + store.tables.bucketTable.byId[argument]?.name
    dataObj.tab.serviceId = store.tables.bucketTable.byId[argument]?.service.id
    dataObj.tab.bucketId = argument
    // index值用于区分默认值
    // index = index + 1
    // dataObj.tab.index = index.toString()
    dataObj.results = respGetBuckets.data
    pathArr.value.push(dataObj)
  }
  tabActive.value = pathArr.value[0].tab.optionId
}
const search = async () => {
  if (selection.value.length === 0) {
    Notify.create({
      classes: 'notification-negative shadow-15',
      icon: 'mdi-alert',
      textColor: 'negative',
      message: `${tc('请选择服务以及存储桶')}`,
      position: 'bottom',
      closeBtn: true,
      timeout: 5000,
      multiLine: false
    })
  } else if (keyword.value === '') {
    Notify.create({
      classes: 'notification-negative shadow-15',
      icon: 'mdi-alert',
      textColor: 'negative',
      message: `${tc('请输入对象关键字')}`,
      position: 'bottom',
      closeBtn: true,
      timeout: 5000,
      multiLine: false
    })
  } else {
    navigateToUrl('/my/storage/search/?bucket=' + selection.value.join('/') + '&keyword=' + keyword.value)
  }
}
const resetSearch = () => {
  navigateToUrl('/my/storage/search/?bucket=' + selection.value.join('/'))
}
emitter.on('refresh', async (value) => {
  if (value) {
    await getSearchDate()
  }
})
onBeforeMount(async () => {
  if (bucketId && !defaultKeyword) {
    selection.value = bucketId.split('/')
  }
  if (bucketId && defaultKeyword) {
    selection.value = bucketId.split('/')
    keyword.value = defaultKeyword
    if (store.tables.serviceTable.status !== 'total') {
      void await store.loadServiceTable()
      if (store.tables.bucketTable.status !== 'part') {
        await store.loadBucketTable()
      }
    }
    await getSearchDate()
  }
})
onBeforeUnmount(() => {
  // 离开页面清空emitter
  emitter.off('done')
})
</script>

<template>
  <div class="IntegratedSearch">
    <div class="q-mt-md">
      <div class="text-subtitle1">
        <span>{{ tc('搜索范围') }}</span>
      </div>
      <div>
        <div v-for="(option, optionIndex) in searchOptions" :key="optionIndex" class="q-mt-lg">
          <div class="row items-center">
            <div class="text-subtitle1 col-2">{{ i18n.global.locale === 'zh' ? option.service.serviceName : option.service.serviceNameEn}}</div>
            <div v-if="option.bucket.length !== 0">
              <q-checkbox v-for="(bucket, bucketIndex) in option.bucket" v-model="selection" :key="bucketIndex"
                          :val="bucket.bucketId" :label="bucket.bucketName"/>
            </div>
            <div v-else class="text-center q-py-xs">{{ tc('暂无存储桶') }}</div>
          </div>
          <q-separator class="q-mt-md" style="width: 800px" />
        </div>
      </div>
      <div class="text-subtitle1 q-mt-md">
        <span>{{ tc('关键字') }}</span>
      </div>
      <div class="row q-mt-md">
        <q-input class="col-3" outlined v-model="keyword" :label="tc('请输入对象关键字')"/>
      </div>
      <q-btn unelevated no-caps class="q-py-sm q-px-lg q-mt-sm" color="primary" :label="tc('搜索')" @click="search"/>
      <q-btn unelevated no-caps class="q-py-sm q-px-lg q-mt-sm q-ml-sm" color="primary" :label="tc('重置搜索')" @click="resetSearch"/>
    </div>
    <div class="q-mt-md">
      <div class="row">
        <q-tabs
          v-model="tabActive"
          dense
          class="bg-grey-2"
          active-color="primary"
          indicator-color="primary"
          align="left"
          narrow-indicator
        >
          <q-tab v-for="(tabItem, index) in pathArr" :key="tabItem.tab.optionId" :name="tabItem.tab.optionId" no-caps>
            <div class="q-py-xs">
              <span>{{ i18n.global.locale === 'zh' ? tabItem.tab.name : tabItem.tab.nameEn }}</span>
              <q-icon class="q-ml-xs" color="black" name="las la-times" size="sm" @click.stop="dynamicTab(index)"/>
            </div>
          </q-tab>
        </q-tabs>
      </div>
      <q-tab-panels v-model="tabActive" animated transition-prev="fade" transition-next="fade">
        <q-tab-panel v-for="tabItem in pathArr" :name="tabItem.tab.optionId" :key="tabItem.tab.optionId"
                     class="no-padding q-mt-sm">
          <SearchTable :pathArr="tabItem"/>
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.IntegratedSearch {
}
</style>
