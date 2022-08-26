<script setup lang="ts">
import { ref, computed } from 'vue'
// import { navigateToUrl } from 'single-spa'
import { FileInterface, useStore } from 'stores/store'
import storage from 'src/api/index'
import { useRouter } from 'vue-router'
import { i18n } from 'boot/i18n'
import useClipText from 'src/hooks/useClipText'
import useFormatSize from 'src/hooks/useFormatSize'
import { Notify } from 'quasar'

// const props = defineProps({
//   foo: {
//     type: String,
//     required: false,
//     default: ''
//   }
// })
// const emits = defineEmits(['change', 'delete'])
const filterOptions = computed(() => store.getBuckets)
// 把过长的文本缩短
const clipText70 = useClipText(70)

// 格式化size
const formatSize1024 = useFormatSize(1024)
const store = useStore()
// const route = useRoute()
const router = useRouter()
const { tc } = i18n.global
const tableRow = ref([])
const isLoading = ref(false)
const searchQuery = ref({
  bucket: '',
  keyword: ''
})
const selected = ref<FileInterface[]>([])
const columns = computed(() => [
  {
    name: 'name',
    label: (() => tc('文件名'))(),
    field: 'name',
    align: 'left',
    headerStyle: 'padding: 0 0 0 1px',
    style: 'max-width: 1200px;padding: 15px 0px',
    classes: 'ellipsis',
    sortable: true
  },
  {
    name: 'time',
    label: (() => tc('上传时间'))(),
    field: 'time',
    align: 'left',
    headerStyle: 'padding: 0 0 0 1px',
    style: 'padding: 15px 0px; width: 500px',
    classes: '',
    sortable: true
  },
  {
    name: 'size',
    label: (() => tc('文件大小'))(),
    field: 'size',
    align: 'left',
    headerStyle: 'padding: 0 0 0 1px',
    style: 'padding: 15px 0px; width: 500px',
    classes: '',
    sortable: true
  },
  {
    name: 'access',
    label: (() => tc('访问权限'))(),
    field: 'access',
    align: 'left',
    headerStyle: 'padding: 0 0 0 1px',
    style: 'padding: 15px 0px; width: 500px',
    classes: ''
  }
])
const selectBucket = (val: string) => {
  searchQuery.value.bucket = val
}
const search = async () => {
  if (searchQuery.value.bucket === '') {
    Notify.create({
      classes: 'notification-negative shadow-15',
      icon: 'mdi-alert',
      textColor: 'negative',
      message: `${tc('请选择存储桶')}`,
      position: 'bottom',
      closeBtn: true,
      timeout: 5000,
      multiLine: false
    })
  } else if (searchQuery.value.keyword === '') {
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
    const respSearchObject = await storage.storage.api.getSearchObject({
      query: {
        bucket: searchQuery.value.bucket,
        search: searchQuery.value.keyword
      }
    })
    tableRow.value = respSearchObject.data.files
    isLoading.value = false
  }
}
</script>

<template>
  <div class="SearchList">
    <div class="row items-center">
      <div class="col-2">
        <!--        <div class="row items-center">-->
        <!--          <div class="col-auto">{{ tc('存储桶') }}:</div>-->
        <!--          <div class="col-9">-->
        <q-select outlined dense v-model="searchQuery.bucket" :options="filterOptions" :label="tc('请选择存储桶')"
                  @update:model-value="selectBucket"/>
        <!--          </div>-->
        <!--        </div>-->
      </div>
      <div class="col-2 q-ml-md">
        <!--        <div class="row items-center">-->
        <!--          <div class="col-2">{{ tc('对象关键字') }}：</div>-->
        <!--          <div class="col-7 q-ml-xs">-->
        <q-input outlined dense v-model="searchQuery.keyword" :label="tc('请输入对象关键字')"/>
        <!--          </div>-->
        <!--        </div>-->
      </div>
      <div>
        <q-btn unelevated no-caps class="q-ml-md" color="primary" :label="tc('搜索')" @click="search"/>
      </div>
    </div>
    <div class="row items-center title-area q-mt-xl">
      <q-btn icon="arrow_back_ios" color="primary" flat unelevated dense @click="router.back()"/>
      <span class="text-primary text-h6 text-weight-bold">{{ tc('返回文件列表') }}</span>
    </div>
    <div class="q-mt-xl">
      <q-table
        class="rounded-borders"
        flat
        square
        table-header-class="bg-grey-1 text-grey"
        :rows="tableRow"
        :columns="columns"
        row-key="name"
        hide-pagination
        :loading="isLoading"
        :pagination="{rowsPerPage: 0}"
        :no-data-label="tc('没有文件')"
        selection="multiple"
        v-model:selected="selected"
      >
        <template v-slot:header-selection="scope">
          <q-checkbox style="" v-model="scope.selected" dense size="xs"/>
        </template>

        <template v-slot:body="props">
          <q-tr :props="props" :class="props.expand ? 'bg-blue-1':''">

            <q-td auto-width>
              <q-checkbox v-model="props.selected" dense size="xs"/>
            </q-td>

            <q-td key="name" :props="props">
              <q-btn flat no-caps color="black" padding="none" :ripple="false">
                <div class="row items-center no-wrap">
                  <q-icon class="col-auto" color="grey" name="insert_drive_file"/>
                  <div class="col-auto"> {{ clipText70(props.row.name) }}</div>
                </div>
              </q-btn>
            </q-td>

            <q-td key="time" :props="props">
              {{ new Date(props.row.ult).toLocaleString(i18n.global.locale) }}
            </q-td>

            <q-td key="size" :props="props">
              <div v-if="!props.row.fod"> -</div>
              <div v-else>
                {{ formatSize1024(props.row.si) }}
              </div>

            </q-td>

            <q-td key="access" :props="props">
              {{ tc(props.row.access_permission) }}
            </q-td>

          </q-tr>

        </template>
      </q-table>
      <q-separator/>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.SearchList {
}
</style>
