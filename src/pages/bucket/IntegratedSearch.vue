<script setup lang="ts">
import { ref, computed, Ref, onBeforeUnmount } from 'vue'
import { useStore } from 'stores/store'
import storage from 'src/api/index'
import { useRoute/* , useRouter */ } from 'vue-router'
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

const filterOptions = computed(() => store.getBuckets)
const firstBucket = computed(() => store.getFirstsBucket)
const { tc } = i18n.global
const store = useStore()
const route = useRoute()
// const router = useRouter()
const bucket = route.query.bucket as string
const defaultBucket = ref()
const pathObj: Ref = ref({})
const isLoading = ref(false)
const model = ref(
  {
    id: firstBucket,
    desc: firstBucket
  })
if (bucket) {
  defaultBucket.value = {
    id: bucket,
    desc: bucket
  }
} else {
  defaultBucket.value = model.value
}
const searchQuery = ref({
  bucket: defaultBucket,
  keyword: ''
})
const selectBucket = (val: string) => {
  searchQuery.value.bucket = val
}
const getSearchDate = async () => {
  const respSearchObject = await storage.storage.api.getSearchObject({
    query: {
      bucket: searchQuery.value.bucket.id,
      search: searchQuery.value.keyword
    }
  })
  pathObj.value = respSearchObject.data
}
const search = async () => {
  if (searchQuery.value.keyword === '') {
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
    isLoading.value = true
    await getSearchDate()
    isLoading.value = false
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
  <div class="SearchList">
<!--    <div class="row items-center title-area q-mt-lg">-->
<!--      <q-btn icon="arrow_back_ios" color="primary" flat unelevated dense @click="router.back()"/>-->
<!--      <span class="text-primary text-h6 text-weight-bold">{{ tc('返回上一级') }}</span>-->
<!--    </div>-->
    <div class="row items-center q-mt-md">
      <div class="col-2">
        <q-select outlined dense :label="tc('请选择存储桶')" v-model="defaultBucket" option-value="id"
                  option-label="desc" option-disable="inactive" mit-value map-options
                  @update:model-value="selectBucket" :options="filterOptions">
          <template v-slot:selected-item="scope">
                <span :class="defaultBucket.id===scope.opt.id ? 'text-primary' : 'text-black'">
                  {{ scope.opt.id }}
                </span>
          </template>
        </q-select>
      </div>
      <div class="col-2 q-ml-md">
        <q-input outlined dense v-model="searchQuery.keyword" :label="tc('请输入对象关键字')"/>
      </div>
      <div>
        <q-btn unelevated no-caps class="q-ml-md" color="primary" :label="tc('搜索')" @click="search"/>
      </div>
    </div>
    <div class="q-mt-sm">
      <SearchTable :pathObj="pathObj"/>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.SearchList {
}
</style>
