<script setup lang="ts">
import { ref, computed, Ref, onBeforeUnmount } from 'vue'
import { useStore } from 'stores/store'
// import { useRoute/* , useRouter */ } from 'vue-router'
import { i18n } from 'boot/i18n'
import { Notify } from 'quasar'
import emitter from 'boot/mitt'
import SearchTable from 'components/bucket/SearchTable.vue'
import api from 'src/api'

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
// 获取第一个服务 用于默认值
const firstSearchOptions = computed(() => store.getFirstsIntegratedSearchOptionName)
// 获取第一个服务 用于默认值
const firstSearchOptionsId = computed(() => store.getFirstsIntegratedSearchOptionId)

const { tc } = i18n.global
const store = useStore()
// const route = useRoute()
// const router = useRouter()
// 选定默认值
const tabActive: Ref<string> = ref('1')
const serviceModel: Ref = ref([])
const pathArr: Ref = ref([])
const keyword = ref('')
const defaultModel = {
  id: firstSearchOptionsId,
  desc: firstSearchOptions
}
// 添加第一个值作为默认值
serviceModel.value.push(defaultModel)
pathArr.value.push({
  tab: {
    id: firstSearchOptionsId,
    desc: firstSearchOptions,
    index: '1'
  },
  // 第一次进页面数据默认为空
  results: []
})
const getSearchDate = async () => {
  pathArr.value = []
  let index = 0
  for (const service of serviceModel.value) {
    const dataObj = {
      // tab为对应的tab信息
      tab: {
        id: '',
        desc: '',
        index: ''
      },
      // results为搜索数据
      results: []
    }
    const base = store.tables.serviceTable.byId[store.tables.bucketTable.byLocalId[service.id]?.service_id]?.endpoint_url
    const bucketName = store.tables.bucketTable.byLocalId[service.id]?.name
    const respGetBuckets = await api.storage.single.getSearchObject({
      base,
      query: {
        bucket: bucketName,
        search: keyword.value
      }
    })
    dataObj.tab.id = service.id
    dataObj.tab.desc = service.desc
    // index值用于区分默认值
    index = index + 1
    dataObj.tab.index = index.toString()
    dataObj.results = respGetBuckets.data
    pathArr.value.push(dataObj)
  }
}
const search = async () => {
  if (serviceModel.value.length === 0) {
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
    await getSearchDate()
  }
}
// 接受子组件操作完成emitter，更新数据
emitter.on('done', async (value) => {
  if (value) {
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
    <div class="row items-center q-mt-md">
      <div style="width: 605px">
        <q-select
          outlined
          multiple
          v-model="serviceModel"
          option-value="id"
          option-label="desc"
          option-disable="inactive"
          mit-value
          map-options
          :options="searchOptions"
          use-chips
          stack-label
          label="请选择"
        />
      </div>
      <div class="col-2 q-ml-md">
        <q-input outlined v-model="keyword" :label="tc('请输入对象关键字')"/>
      </div>
      <q-btn unelevated no-caps class="q-ml-md q-py-sm q-px-lg" color="primary" :label="tc('搜索')" @click="search"/>
    </div>
    <div class="q-mt-lg">
      <div class="row">
        <div class="col-auto">
          <q-tabs
            v-model="tabActive"
            dense
            class="bg-grey-2"
            active-color="primary"
            indicator-color="primary"
            align="justify"
            narrow-indicator
          >
            <q-tab v-for="tabItem in pathArr" :name="tabItem.tab.index" :label="tabItem.tab.desc" :key="tabItem.tab.id"
                   no-caps/>
          </q-tabs>
        </div>
      </div>
      <q-tab-panels v-model="tabActive" animated transition-prev="fade" transition-next="fade">
        <q-tab-panel v-for="tabItem in pathArr" :name="tabItem.tab.index" :key="tabItem.tab.id"
                     class="no-padding q-mt-sm">
          <SearchTable :pathArr="tabItem.results" :tabArr="serviceModel"/>
        </q-tab-panel>
      </q-tab-panels>

    </div>
  </div>
</template>

<style lang="scss" scoped>
.IntegratedSearch {
}
</style>
