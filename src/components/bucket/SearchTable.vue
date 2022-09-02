<script lang="ts" setup>
import { ref, computed, PropType, watch } from 'vue'
import { FileInterface, FileObjInterface } from 'src/stores/store'
import { useStore } from 'stores/store'
// import { useRoute } from 'vue-router'
import { i18n } from 'boot/i18n'
import storage from 'src/api/index'
import useClipText from '../../../src/hooks/useClipText'
import useFormatSize from '../../../src/hooks/useFormatSize'
import { Notify } from 'quasar'

const props = defineProps({
  pathObj: {
    type: Object as PropType<FileObjInterface>,
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

const deleteSingleFile = (name: string) => {
  const dataArr = []
  dataArr.push(name)
  void store.triggerDeleteFolderDialog({
    localId: props.pathObj.bucket,
    dirNames: { fileArrs: dataArr },
    isSearch: true
  })
}
const batchDeleteFile = async () => {
  const fileArr: string[] = []
  selected.value.forEach((item) => {
    fileArr.push(item.name)
  })
  void store.triggerDeleteFolderDialog({
    localId: props.pathObj.bucket,
    dirNames: { fileArrs: fileArr },
    isSearch: true
  })
}
const shareSingleFile = async (name: string, access_code: number) => {
  const dataArr = []
  dataArr.push(name)
  if (access_code === 0) {
    void store.triggerPublicShareDialog({
      localId: props.pathObj.bucket,
      dirNames: { fileArrs: dataArr },
      isSearch: true
    })
  } else {
    void store.triggerAlreadyShareDialog({
      localId: props.pathObj.bucket,
      dirNames: { fileArrs: dataArr }
    })
  }
}
const batchShareFile = async () => {
  const shareObjArr: string[] = []
  selected.value.forEach((item) => {
    shareObjArr.push(item.name)
  })
  void store.triggerPublicShareDialog({
    localId: props.pathObj.bucket,
    dirNames: { fileArrs: shareObjArr },
    isSearch: true
  })
}
const changeName = (name: string) => {
  void store.triggerChangeFolderDialog({
    localId: props.pathObj.bucket,
    dirName: name,
    isSearch: true
  })
}
const download = async (fileName: string) => {
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
  const objPath = props.pathObj.bucket + '/' + fileName
  const res = await storage.storage.api.getObjPath({ path: { objpath: objPath } })
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
  <div class="SearchTable">
    <div class="row q-gutter-md">
      <q-btn class="col-auto" unelevated no-caps color="primary" :label="tc('批量删除')" @click="batchDeleteFile"
             :disable="selected.length > 0 ? false : true"/>
      <q-btn class="col-auto" unelevated no-caps color="primary" :label="tc('批量分享')" @click="batchShareFile"
             :disable="selected.length > 0 ? false : true"/>
    </div>

    <div class="row">

      <div class="col">
        <q-table
          class="rounded-borders"
          flat
          square
          table-header-class="bg-grey-1 text-grey"
          :rows="props.pathObj?.files"
          :columns="columns"
          row-key="name"
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
                <q-btn color="primary" unelevated no-caps @click="deleteSingleFile(props.row.name)">
                  {{ tc('删除') }}
                </q-btn>
                <q-btn class="q-ml-xs" color="primary" unelevated no-caps @click="shareSingleFile(props.row.name, props.row.access_code)">
                  {{tc('公开分享') }}
                </q-btn>
                <q-btn class="q-ml-xs" color="primary" unelevated no-caps
                       @click="changeName(props.row.name)">{{ tc('重命名') }}
                </q-btn>
                <q-btn class="q-ml-xs" color="primary" unelevated no-caps
                       @click="download(props.row.name)">{{ tc('下载') }}
                </q-btn>
                <q-btn color="primary" flat dense no-caps
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
