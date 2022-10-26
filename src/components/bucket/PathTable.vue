<script lang="ts" setup>
import { ref, computed, PropType, watch } from 'vue'
import { FileInterface, PathInterface } from 'src/stores/store'
import { useStore } from 'stores/store'
// import { useRoute } from 'vue-router'
import { navigateToUrl } from 'single-spa'
import { i18n } from 'boot/i18n'
import useClipText from 'src/hooks/useClipText'
import useFormatSize from 'src/hooks/useFormatSize'
import { Notify } from 'quasar'
import api from 'src/api/index'

const props = defineProps({
  pathObj: {
    type: Object as PropType<PathInterface>,
    required: true
  }
})
// const emit = defineEmits(['change', 'delete'])
// code starts...
const store = useStore()
// const route = useRoute()
const { tc } = i18n.global

console.log(props)

const currentBucket = computed(() => store.tables.bucketTable.byId[props.pathObj.bucketId])

const filter = ref('')
const currentPath = computed(() => props.pathObj?.dir_path)
const currentFiles = computed(() => props.pathObj?.files.filter((file: FileInterface) => file.name.toLowerCase().includes(filter.value)))

// const currentServiceId = computed(() => props.pathObj.localId.split('/')[0])
// const arrayPaths = computed(() => props.pathObj?.dir_path?.split('/')[0] === '' ? [] : props.pathObj?.dir_path?.split('/'))
// const upperPath = computed(() => currentPath.value === '' ? '/my/storage/bucket' : `/my/storage/bucket/file?bucket=${currentBucket.value}&path=${currentPath.value?.lastIndexOf('/') === -1 ? '' : currentPath.value?.slice(0, currentPath.value?.lastIndexOf('/'))}`)
// table中选中的对象
const selected = ref<FileInterface[]>([])
const fileDetail = ref({})
// const toggleSelection = (file: FileInterface) => {
//   if (selected.value.filter((item) => item.name === file.name).length === 0) {
//     selected.value.push(file)
//   } else {
//     selected.value = selected.value.filter((item) => item.name !== file.name)
//   }
// }
// 要展示detail的对象
// const fileToShow = ref<FileInterface>()

// 把过长的文本缩短
// const clipText7 = useClipText(7)
const clipText70 = useClipText(70)
// 格式化size
const formatSize1024 = useFormatSize(1024)
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
    // sort: (a: FileInterface, b: FileInterface) => {
    //   if ((!a.fod && !b.fod) || (a.fod && b.fod)) {
    //     return parseInt(a.name, 10) - parseInt(b.name, 10)
    //   } else if (!a.fod && b.fod) {
    //     return 1
    //   } else if (a.fod && !b.fod) {
    //     return -1
    //   }
    // }
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
  },
  {
    name: 'operation',
    label: (() => tc('操作'))(),
    field: 'operation',
    align: 'left',
    headerStyle: 'padding: 0 0 0 1px',
    style: 'padding: 15px 0px; width: 500px',
    classes: ''
  }
])

const singleDelete = (na: string, name: string, fod: boolean) => {
  const dataArr = []
  const obj = {
    na: '',
    name: ''
  }
  obj.na = na
  obj.name = name
  dataArr.push(obj)
  if (fod) {
    void store.triggerDeleteFolderDialog(props.pathObj.bucketId, props.pathObj.localId, props.pathObj.bucket_name, { fileArrs: dataArr }, true)
  } else {
    void store.triggerDeleteFolderDialog(props.pathObj.bucketId, props.pathObj.localId, props.pathObj.bucket_name, { dirArrs: dataArr }, true)
  }
}
const batchDelete = async () => {
  const dirArr: Record<string, string>[] = []
  const fileArr: Record<string, string>[] = []
  selected.value.forEach((item) => {
    const obj = {
      na: '',
      name: ''
    }
    if (item.fod) {
      obj.na = item.na
      obj.name = item.name
      fileArr.push(obj)
    } else {
      obj.na = item.na
      obj.name = item.name
      dirArr.push(obj)
    }
  })
  void store.triggerDeleteFolderDialog(props.pathObj.bucketId, props.pathObj.localId, props.pathObj.bucket_name, {
    dirArrs: dirArr,
    fileArrs: fileArr
  }, true)
}
const singleShare = async (na: string, name: string, accessCode: number, fod: boolean) => {
  const dataArr = []
  const obj = {
    na: '',
    name: ''
  }
  obj.na = na
  obj.name = name
  dataArr.push(obj)
  if (accessCode === 0) {
    if (fod) {
      void store.triggerPublicShareDialog(props.pathObj.bucketId, props.pathObj.localId, props.pathObj.bucket_name, { fileArrs: dataArr }, true)
    } else {
      void store.triggerPublicShareDialog(props.pathObj.bucketId, props.pathObj.localId, props.pathObj.bucket_name, { dirArrs: dataArr }, true)
    }
  } else {
    if (fod) {
      void store.triggerAlreadyShareDialog(props.pathObj.bucketId, props.pathObj.localId, props.pathObj.bucket_name, { fileArrs: dataArr }, true, false)
    } else {
      void store.triggerAlreadyShareDialog(props.pathObj.bucketId, props.pathObj.localId, props.pathObj.bucket_name, { dirArrs: dataArr }, true, false)
    }
  }
}
const batchShare = async () => {
  const shareDirArr: Record<string, string>[] = []
  const shareObjArr: Record<string, string>[] = []
  selected.value.forEach((item) => {
    const obj = {
      na: '',
      name: ''
    }
    if (item.fod === false) {
      obj.na = item.na
      obj.name = item.name
      shareDirArr.push(obj)
    } else {
      obj.na = item.na
      obj.name = item.name
      shareObjArr.push(obj)
    }
  })
  void store.triggerPublicShareDialog(props.pathObj.bucketId, props.pathObj.localId, props.pathObj.bucket_name, {
    dirArrs: shareDirArr,
    fileArrs: shareObjArr
  }, true)
}
const changeName = (path: string, name: string) => {
  void store.triggerChangeFolderDialog(props.pathObj.bucketId, props.pathObj.localId, props.pathObj.bucket_name, path, name, true)
}
const download = async (fileName: string, na: string) => {
  // 创建a标签
  // const a = document.createElement('a')
  // 定义下载名称
  // a.download = fileName
  // 隐藏标签
  // a.style.display = 'none'
  // 设置文件路径
  // a.href = download_url
  // 将创建的标签插入dom
  // document.body.appendChild(a)
  // 点击标签，执行下载
  // a.click()
  // 将标签从dom移除
  // document.body.removeChild(a)
  Notify.create({
    classes: 'notification-positive shadow-15',
    icon: 'las la-redo-alt',
    textColor: 'positive',
    message: `${tc('正在下载中，请稍等')}...`,
    position: 'bottom',
    closeBtn: true,
    timeout: 5000,
    multiLine: false
  })
  const base = store.tables.serviceTable.byId[store.tables.bucketTable.byId[props.pathObj.bucketId]?.service.id]?.endpoint_url
  console.log(props.pathObj.localId)
  const objPath = props.pathObj.bucket_name + '/' + na
  const res = await api.storage.single.getObjPath({
    base,
    path: { objpath: objPath }
  })
  const url = window.URL.createObjectURL(new Blob([res.data]))
  const link = document.createElement('a')
  link.style.display = 'none'
  link.href = url
  link.setAttribute('download', fileName)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  // 释放blob URL地址
  window.URL.revokeObjectURL(url)
  Notify.create({
    classes: 'notification-positive shadow-15',
    icon: 'las la-redo-alt',
    textColor: 'positive',
    message: tc('下载完成'),
    position: 'bottom',
    closeBtn: true,
    timeout: 5000,
    multiLine: false
  })
}
const toggleExpansion = (props: { expand: boolean, row: FileInterface }) => {
  if (props.expand) {
    props.expand = !props.expand
  } else {
    props.expand = !props.expand
    Object.assign(fileDetail.value, { [props.row.name]: props.row })
  }
}
watch(
  () => props.pathObj?.files,
  () => {
    selected.value = []
  },
  {
    immediate: true,
    deep: true
  }
)
</script>

<template>
  <div class="PathTable">
    <div class="row items-center justify-between q-pb-md">
      <div class="col q-gutter-x-md">
        <q-btn class="col-auto" unelevated no-caps color="primary" :label="tc('创建文件夹')"
               @click="store.triggerCreateFolderDialog(props.pathObj.bucketId, props.pathObj.localId, props.pathObj.bucket_name, props.pathObj.dir_path)"/>
        <q-btn class="col-auto" unelevated no-caps color="primary" :label="tc('上传文件')"
               @click="store.triggerUploadDialog(props.pathObj.bucketId, props.pathObj.localId, props.pathObj.bucket_name, props.pathObj.dir_path)"/>
        <q-btn class="col-auto" unelevated no-caps color="primary" :label="tc('删除文件')" @click="batchDelete"
               :disable="selected.length<=0"/>
        <q-btn class="col-auto" unelevated no-caps color="primary" :label="tc('公开分享')" @click="batchShare"
               :disable="selected.length<=0"/>
      </div>

      <q-input
        class="col-2"
        dense
        outlined
        stack-label
        :label="tc('筛选对象')"
        v-model="filter"
      >
        <template v-slot:prepend>
          <q-icon name="search"/>
        </template>
        <template v-slot:append v-if="filter">
          <q-icon name="close" @click="filter = ''" class="cursor-pointer"/>
        </template>
      </q-input>

    </div>

    <div class="row">

      <div class="col">
        <q-table
          class="rounded-borders"
          flat
          square
          table-header-class="bg-grey-1 text-grey"
          :rows="currentFiles"
          :columns="columns"
          row-key="name"
          hide-pagination
          :pagination="{rowsPerPage: 0}"
          :loading="store.tables.pathTable.status === 'loading'"
          :no-data-label="tc('没有文件')"
          selection="multiple"
          v-model:selected="selected"
        >
          <template v-slot:header-selection="scope">
            <q-checkbox style="" v-model="scope.selected" dense size="xs"/>
          </template>

          <!--      <template v-slot:body-selection="scope">-->
          <!--        <q-toggle v-model="scope.selected" />-->
          <!--      </template>-->

          <template v-slot:body="props">
            <q-tr :props="props" :class="props.expand ? 'bg-blue-1':''">

              <q-td auto-width>
                <q-checkbox v-model="props.selected" dense size="xs"/>
              </q-td>

              <q-td key="name" :props="props">

                <q-btn class="q-mr-md" v-if="!props.row.fod" flat no-caps padding="none"
                       @click="navigateToUrl('/my/storage/bucket/' + currentBucket?.id + '/object' +'?path=' + (currentPath? currentPath + '/' : '') + props.row.name)">
                  <div class="row items-center no-wrap">
                    <q-icon class="col-auto" color="yellow-8" name="folder"/>
                    <div class="col-auto text-black"> {{ clipText70(props.row.name) }}</div>
                  </div>
                </q-btn>

                <q-btn class="q-mr-md" v-if="props.row.fod" flat no-caps color="black" padding="none" :ripple="false"
                       @click="toggleExpansion(props)">
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

              <q-td key="operation" :props="props">
                <q-btn color="primary" unelevated no-caps
                       @click="singleDelete(props.row.na, props.row.name, props.row.fod)">
                  {{ tc('删除') }}
                </q-btn>
                <q-btn class="q-ml-xs" color="primary" unelevated no-caps
                       @click="singleShare(props.row.na, props.row.name, props.row.access_code, props.row.fod)">{{
                    tc('公开分享')
                  }}
                </q-btn>
                <q-btn v-if="props.row.fod === true" class="q-ml-xs" color="primary" unelevated no-caps
                       @click="changeName(props.row.na, props.row.name)">{{ tc('重命名') }}
                </q-btn>
                <q-btn v-if="props.row.fod === true" class="q-ml-xs" color="primary" unelevated no-caps
                       @click="download(props.row.name, props.row.na)">{{ tc('下载') }}
                </q-btn>
                <!--                <q-btn color="primary" unelevated @click="download(fileDetail[props.row.name]?.name, fileDetail[props.row.name]?.download_url)">{{ tc('下载') }}</q-btn>-->
                <q-btn v-if="props.row.fod === true" color="primary" flat dense no-caps
                       :label="props.expand ? tc('折叠详情') : tc('展开详情')" @click="toggleExpansion(props)"></q-btn>
              </q-td>

            </q-tr>
            <q-tr v-show="props.expand" :props="props" class="bg-blue-1">

              <q-td auto-width>
              </q-td>

              <q-td key="name" class="text-center" style="padding: 15px 0px">
                <q-icon name="subdirectory_arrow_right" size="sm" color="grey-7"/>
              </q-td>

              <q-td colspan="100%" style="padding: 15px 0px">
                <div class="column q-gutter-md">
                  <div class="col-auto text-bold">
                    {{ fileDetail[props.row.name]?.name }}
                  </div>
                </div>
                <q-separator/>
                <div class="row">
                  <div>
                    <div>
                      {{ tc('创建时间') }}: {{
                        new Date(fileDetail[props.row.name]?.ult).toLocaleString(i18n.global.locale)
                      }}
                    </div>
                    <div>
                      {{ tc('文件大小') }}: {{ fileDetail[props.row.name]?.si }}
                    </div>
                    <div>
                      {{ tc('下载次数') }}: {{ fileDetail[props.row.name]?.dlc }}
                    </div>
                  </div>
                  <div class="q-ml-xl">
                    <div>{{ tc('最后修改') }}:
                      {{ new Date(fileDetail[props.row.name]?.upt).toLocaleString(i18n.global.locale) }}
                    </div>
                    <!--                    <div>{{ fileDetail[props.row.name]?.access_permission }}</div>-->
                    <div>{{ tc('访问权限') }}: {{ tc(props.row.access_permission) }}</div>
                    <div>MD5: {{ fileDetail[props.row.name]?.md5 }}</div>
                  </div>
                </div>
              </q-td>
            </q-tr>
          </template>
        </q-table>
        <q-separator/>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.PathTable {
}

.my-sticky-header-table {
  /* height or max-height is important */
  height: 200px;

  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th {
    /* bg color is important for th; just specify one */
    background-color: #c1f4cd;
  }

  thead tr th {
    position: sticky;
    z-index: 1;
  }

  thead tr:first-child th {
    top: 0;
  }

  /* this is when the loading indicator appears */
  &.q-table--loading thead tr:last-child th {
    /* height of all previous header rows */
    top: 48px;
  }
}
</style>
