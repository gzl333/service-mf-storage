<script setup lang="ts">
import { ref, computed, Ref, onBeforeUnmount } from 'vue'
import { useStore } from 'stores/store'
// import { useRoute/* , useRouter */ } from 'vue-router'
import { i18n } from 'boot/i18n'
import { Notify } from 'quasar'
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

const searchOptions = computed(() => store.getIntegratedSearchOptions)
const firstSearchOptions = computed(() => store.getFirstsIntegratedSearchOption)
const firstSearchOptionsId = computed(() => store.getFirstsIntegratedSearchOptionId)
const { tc } = i18n.global
const store = useStore()
// const route = useRoute()
// const router = useRouter()
const selectModel: Ref = ref([])
const pathArr: Ref = ref([])
const keyword = ref('')
const model = {
  id: firstSearchOptionsId,
  desc: firstSearchOptions
}
selectModel.value.push(model)
pathArr.value.push({
  tab: {
    id: firstSearchOptionsId,
    desc: firstSearchOptions,
    index: '1'
  },
  results: []
})
const getSearchDate = async () => {
  pathArr.value = []
  let index = 0
  for (const argument of selectModel.value) {
    const dataObj = {
      tab: {
        id: '',
        desc: '',
        index: ''
      },
      results: []
    }
    const res = await store.getSearchTable(argument.id, keyword.value)
    dataObj.tab.id = argument.id
    dataObj.tab.desc = argument.desc
    index = index + 1
    dataObj.tab.index = index.toString()
    dataObj.results = res.data
    pathArr.value.push(dataObj)
  }
}
const search = async () => {
  if (keyword.value === '') {
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
emitter.on('done', async (value) => {
  if (value) {
    await getSearchDate()
  }
})
onBeforeUnmount(() => {
  emitter.off('done')
})
</script>

<template>
  <div class="IntegratedSearch">
    <div class="row items-center q-mt-md">
      <div style="width: 610px">
        <q-select
          outlined
          multiple
          v-model="selectModel"
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
      <SearchTable :pathArr="pathArr" :tabArr="selectModel"/>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.IntegratedSearch {
}
</style>
