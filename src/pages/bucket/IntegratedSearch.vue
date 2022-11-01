<script setup lang="ts">
import { ref, computed, Ref, onBeforeUnmount } from 'vue'
import { useStore } from 'stores/store'
// import { useRoute/* , useRouter */ } from 'vue-router'
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
// const route = useRoute()
// const router = useRouter()
// 选定默认值
const tabActive: Ref<string> = ref('')
const pathArr: Ref = ref([])
const searchScope: Ref<string[]> = ref([])
const selection = ref([])
const keyword = ref('')
// const chooseTabService = () => {
//   // 添加第一个值作为默认值
//   serviceModel.value[0] = searchOptions.value[0]
//   pathArr.value[0] = {
//     tab: {
//       optionId: searchOptions.value[0]?.optionId,
//       desc: searchOptions.value[0]?.desc,
//       bucketId: searchOptions.value[0]?.bucketId,
//       serviceId: searchOptions.value[0]?.serviceId,
//       index: '1'
//     },
//     // 第一次进页面数据默认为空
//     results: []
//   }
// }
// chooseTabService()
const dynamicTab = (index: number) => {
  pathArr.value.splice(index, 1)
  tabActive.value = pathArr.value[0].tab.optionId
}
const selectSearchScope = (value: string[]) => {
  const scopeArr = []
  for (const bucket of value) {
    const searchScopeStr = store.tables.bucketTable.byId[bucket]?.service.name + '/' + store.tables.bucketTable.byId[bucket]?.name
    scopeArr.push(searchScopeStr)
  }
  searchScope.value = scopeArr
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
    await getSearchDate()
  }
}
// watch(searchOptions, chooseTabService)
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
    <div class="q-mt-md">
      <div class="text-subtitle1">
        <span>搜索范围：</span>
        <span v-for="(item, index) in searchScope" :key="index">{{ item }}&nbsp;&nbsp;&nbsp;</span>
      </div>
      <div>
        <div v-for="(option, optionIndex) in searchOptions" :key="optionIndex" class="row q-mt-lg items-center">
          <div class="text-subtitle1 col-2">{{ option.service.serviceName }}</div>
          <q-card flat bordered class="my-card col-4">
            <q-card-section>
              <div v-if="option.bucket.length !== 0">
                <q-checkbox v-for="(bucket, bucketIndex) in option.bucket" v-model="selection" :key="bucketIndex" :val="bucket.bucketId" :label="bucket.bucketName" @update:model-value="selectSearchScope"/>
              </div>
              <div v-else class="text-center q-py-xs">暂无存储桶</div>
            </q-card-section>
          </q-card>
        </div>
      </div>
      <div class="text-subtitle1 q-mt-md">
        <span>关键字：</span>
        <span>{{ keyword }}</span>
      </div>
      <div class="row q-mt-md">
        <q-input class="col-3" outlined v-model="keyword" :label="tc('请输入对象关键字')"/>
      </div>
      <q-btn unelevated no-caps class="q-py-sm q-px-lg q-mt-sm" color="primary" :label="tc('搜索')" @click="search"/>
    </div>
    <div class="q-mt-md">
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
            <div v-for="(tabItem, index) in pathArr" :key="tabItem.tab.optionId" class="row">
              <q-tab :name="tabItem.tab.optionId" :label="tabItem.tab.name" no-caps class="q-mt-xs"></q-tab>
              <div @click="dynamicTab(index)" class="cursor-pointer">
                <q-icon name="las la-times" size="xs"/>
              </div>
            </div>
<!--            <q-tab v-for="tabItem in pathArr" :name="tabItem.tab.index" :label="tabItem.tab.name" :key="tabItem.tab.optionId" no-caps style="height: 50px">-->
<!--              <q-badge floating transparent @click="fun">-->
<!--                <q-icon name="las la-times"/>-->
<!--              </q-badge>-->
<!--            </q-tab>-->
          </q-tabs>
        </div>
      </div>
      <q-tab-panels v-model="tabActive" animated transition-prev="fade" transition-next="fade" class="no-scroll">
        <q-tab-panel v-for="tabItem in pathArr" :name="tabItem.tab.optionId" :key="tabItem.tab.optionId"
                     class="no-padding q-mt-sm no-scroll ">
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
