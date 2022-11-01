<script lang="ts" setup>
import { ref, computed, watch, Ref } from 'vue'
import { FileInterface } from 'src/stores/store'
import { useStore } from 'stores/store'
// import { useRoute } from 'vue-router'
import { i18n } from 'boot/i18n'
import { Notify } from 'quasar'
import api from 'src/api'
import useClipText from '../../../src/hooks/useClipText'
import useFormatSize from '../../../src/hooks/useFormatSize'

// interface ArrayInterface {
//   bucketId: string,
//   optionId: string,
//   serviceId: string,
//   desc: string,
// }

const props = defineProps({
  pathArr: {
    type: Object,
    required: true
  }
})
// const emit = defineEmits(['change', 'delete'])
// code starts...
const store = useStore()
const { tc } = i18n.global
// table中选中的对象
const selected = ref<FileInterface[]>([])
const fileDetail = ref({})
const tabActive: Ref<string> = ref('1')

// 把过长的文本缩短
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

// 删除单个文件
const deleteSingleFile = (na: string, name: string) => {
  const dataArr = []
  const obj = {
    na: '',
    name: ''
  }
  obj.na = na
  // 添加name用于删除失败 提示文件名
  obj.name = name
  dataArr.push(obj)
  let str: string
  if (na.lastIndexOf('/') !== -1) {
    str = props.pathArr.tab.bucketId + '/' + na.slice(0, na.lastIndexOf('/'))
    // str = props.tabArr[Number(tabActive.value) - 1].bucketId + '/' + na.slice(0, na.lastIndexOf('/'))
  } else {
    str = props.pathArr.tab.bucketId
    // str = props.tabArr[Number(tabActive.value) - 1].bucketId
  }
  void store.triggerDeleteFolderDialog(props.pathArr.tab.bucketId, str, props.pathArr.results.bucket, { fileArrs: dataArr }, false)
  // void store.triggerDeleteFolderDialog(props.tabArr[Number(tabActive.value) - 1].bucketId, str, props.pathArr.bucket, { fileArrs: dataArr }, false)
}
// 删除多个文件 批量删除
// const batchDeleteFile = async () => {
//   let fileArr: Record<string, string>[] = []
//   selected.value.forEach((item) => {
//     fileArr = []
//     const obj = {
//       na: '',
//       name: ''
//     }
//     obj.na = item.na
//     // 添加name用于删除失败 提示文件名
//     obj.name = item.name
//     fileArr.push(obj)
//     void store.triggerDeleteFolderDialog(props.tabArr[Number(tabActive.value) - 1].bucketId, props.tabArr[Number(tabActive.value) - 1].bucketId + '/' + item.na.slice(0, item.na.lastIndexOf('/')), props.pathArr.bucket, { fileArrs: fileArr }, false)
//   })
// }
// 单个文件分享
const shareSingleFile = async (na: string, name: string, accessCode: number) => {
  const dataArr = []
  const obj = {
    na: '',
    name: ''
  }
  obj.na = na
  obj.name = name
  dataArr.push(obj)
  let str: string
  if (na.lastIndexOf('/') !== -1) {
    str = props.pathArr.tab.bucketId + '/' + na.slice(0, na.lastIndexOf('/'))
  } else {
    str = props.pathArr.tab.bucketId
  }
  if (accessCode === 0) {
    void store.triggerPublicShareDialog(props.pathArr.tab.bucketId, str, props.pathArr.results.bucket, { fileArrs: dataArr }, false)
  } else {
    void store.triggerAlreadyShareDialog(props.pathArr.tab.bucketId, str, props.pathArr.results.bucket, { fileArrs: dataArr }, false, false)
  }
}
// 批量分享
// const batchShareFile = async () => {
//   const shareObjArr: Record<string, string>[] = []
//   selected.value.forEach((item) => {
//     const obj = {
//       na: '',
//       name: ''
//     }
//     obj.na = item.na
//     obj.name = item.name
//     shareObjArr.push(obj)
//   })
//   void store.triggerPublicShareDialog(props.tabArr[Number(tabActive.value) - 1].id, props.pathArr.bucket, { fileArrs: shareObjArr }, false)
// }
// 文件重命名
const changeName = (na: string, name: string) => {
  let str: string
  if (na.lastIndexOf('/') !== -1) {
    str = props.pathArr.tab.bucketId + '/' + na.slice(0, na.lastIndexOf('/'))
  } else {
    str = props.pathArr.tab.bucketId
  }
  void store.triggerChangeFolderDialog(props.pathArr.tab.bucketId, str, props.pathArr.results.bucket, na, name, false)
}
const download = async (na: string, fileName: string) => {
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

  // 权限为私有的文件不能通过url直接下载,所以暂时请求后端api进行下载
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
  const objPath = props.pathArr.results.bucket + '/' + na
  const base = store.tables.serviceTable.byId[store.tables.bucketTable.byId[props.pathArr.tab.bucketId]?.service.id]?.endpoint_url
  const downloadRes = await api.storage.single.getObjPath({
    base,
    path: { objpath: objPath }
  })
  const url = window.URL.createObjectURL(new Blob([downloadRes.data]))
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
  () => tabActive,
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
  <div class="SearchTable">
<!--    <div class="row q-mt-sm">-->
<!--      <q-btn class="col-auto" unelevated no-caps color="primary" :label="tc('批量删除')" @click="batchDeleteFile"-->
<!--             :disable="selected.length > 0 ? false : true"/>-->
<!--      <q-btn class="col-auto q-ml-sm" unelevated no-caps color="primary" :label="tc('批量分享')" @click="batchShareFile"-->
<!--             :disable="selected.length > 0 ? false : true"/>-->
<!--    </div>-->
    <div class="row">
      <div class="col">
        <q-table
          class="rounded-borders"
          flat
          square
          table-header-class="bg-grey-1 text-grey"
          :rows="props.pathArr?.results.files"
          :columns="columns"
          row-key="na"
          hide-pagination
          :pagination="{rowsPerPage: 0}"
          :loading="store.tables.pathTable.status === 'loading'"
          :no-data-label="tc('暂无文件对象')"
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
                <q-btn flat no-caps color="black" padding="none" :ripple="false"
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
                {{ formatSize1024(props.row.si) }}
              </q-td>

              <q-td key="access" :props="props">
                {{ tc(props.row.access_permission) }}
              </q-td>

              <q-td key="operation" :props="props">
                <q-btn color="primary" unelevated no-caps @click="deleteSingleFile(props.row.na, props.row.name)">
                  {{ tc('删除') }}
                </q-btn>
                <q-btn class="q-ml-xs" color="primary" unelevated no-caps
                       @click="shareSingleFile(props.row.na, props.row.name, props.row.access_code)">
                  {{ tc('公开分享') }}
                </q-btn>
                <q-btn class="q-ml-xs" color="primary" unelevated no-caps
                       @click="changeName(props.row.na, props.row.name)">{{ tc('重命名') }}
                </q-btn>
                <q-btn class="q-ml-xs" color="primary" unelevated no-caps
                       @click="download(props.row.na, props.row.name)">{{ tc('下载') }}
                </q-btn>
                <q-btn color="primary" flat dense no-caps
                       :label="props.expand ? tc('折叠详情') : tc('展开详情')"
                       @click="toggleExpansion(props)"></q-btn>
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
.SearchTable {
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
