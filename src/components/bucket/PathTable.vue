<script lang="ts" setup>
import { ref, computed, PropType, watch } from 'vue'
import { FileInterface, PathInterface } from 'src/stores/store'
import { useStore } from 'stores/store'
import { navigateToUrl } from 'single-spa'
import { i18n } from 'boot/i18n'
// import storage from 'src/api/index'
import useClipText from '../../../src/hooks/useClipText'
import useFormatSize from '../../../src/hooks/useFormatSize'

const props = defineProps({
  pathObj: {
    type: Object as PropType<PathInterface>,
    required: true
  }
})
// const emit = defineEmits(['change', 'delete'])
// code starts...
const store = useStore()
// const { tc } = i18n.global

const currentBucket = computed(() => props.pathObj?.bucket_name)
const currentPath = computed(() => props.pathObj?.dir_path)
const arrayPaths = computed(() => props.pathObj?.dir_path?.split('/')[0] === '' ? [] : props.pathObj?.dir_path?.split('/'))
const upperPath = computed(() => currentPath.value === '' ? '/my/storage/bucket' : `/my/storage/bucket/file?bucket=${currentBucket.value}&path=${currentPath.value?.lastIndexOf('/') === -1 ? '' : currentPath.value?.slice(0, currentPath.value?.lastIndexOf('/'))}`)
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
const clipText7 = useClipText(7)
const clipText70 = useClipText(70)

// 格式化size
const formatSize1024 = useFormatSize(1024)
const columns = computed(() => [
  {
    name: 'name',
    label: i18n.global.locale === 'zh' ? '文件名' : 'File Name',
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
    label: i18n.global.locale === 'zh' ? '上传时间' : 'Upload Time',
    field: 'time',
    align: 'left',
    headerStyle: 'padding: 0 0 0 1px',
    style: 'padding: 15px 0px; width: 500px',
    classes: '',
    sortable: true
  },
  {
    name: 'size',
    label: i18n.global.locale === 'zh' ? '文件大小' : 'File Size',
    field: 'size',
    align: 'left',
    headerStyle: 'padding: 0 0 0 1px',
    style: 'padding: 15px 0px; width: 500px',
    classes: '',
    sortable: true
  },
  {
    name: 'access',
    label: i18n.global.locale === 'zh' ? '访问权限' : 'Accessibility',
    field: 'access',
    align: 'left',
    headerStyle: 'padding: 0 0 0 1px',
    style: 'padding: 15px 0px; width: 500px',
    classes: ''
  },
  {
    name: 'operation',
    label: i18n.global.locale === 'zh' ? '操作' : 'Operations',
    field: 'operation',
    align: 'left',
    headerStyle: 'padding: 0 0 0 1px',
    style: 'padding: 15px 0px; width: 500px',
    classes: ''
  }
])

const onItemClick = (name: string, fod: boolean) => {
  const dataArr = []
  dataArr.push(name)
  if (fod === false) {
    void store.triggerDeleteFolderDialog({ localId: props.pathObj.localId, dirNames: { dirArrs: dataArr } })
  } else {
    void store.triggerDeleteFolderDialog({ localId: props.pathObj.localId, dirNames: { fileArrs: dataArr } })
  }
}
const changeName = (name: string) => {
  void store.triggerChangeFolderDialog({ localId: props.pathObj.localId, dirName: name })
}
const deleteFile = async () => {
  const dirArr: string[] = []
  const fileArr: string[] = []
  selected.value.forEach((item) => {
    if (item.fod === false) {
      dirArr.push(item.name)
    } else {
      fileArr.push(item.name)
    }
  })
  void store.triggerDeleteFolderDialog({
    localId: props.pathObj.localId,
    dirNames: {
      dirArrs: dirArr,
      fileArrs: fileArr
    }
  })
}
const shareItemClick = async (name: string, access_code: number, fod: boolean) => {
  const dataArr = []
  dataArr.push(name)
  if (access_code === 0) {
    if (fod === false) {
      void store.triggerPublicShareDialog({ localId: props.pathObj.localId, dirNames: { dirArrs: dataArr } })
    } else {
      void store.triggerPublicShareDialog({ localId: props.pathObj.localId, dirNames: { fileArrs: dataArr } })
    }
  } else {
    if (fod === false) {
      void store.triggerAlreadyShareDialog({ localId: props.pathObj.localId, dirNames: { dirArrs: dataArr } })
    } else {
      void store.triggerAlreadyShareDialog({ localId: props.pathObj.localId, dirNames: { fileArrs: dataArr } })
    }
  }
}
const shareFile = async () => {
  const shareDirArr: string[] = []
  const shareObjArr: string[] = []
  selected.value.forEach((item) => {
    if (item.fod === false) {
      shareDirArr.push(item.name)
    } else {
      shareObjArr.push(item.name)
    }
  })
  void store.triggerPublicShareDialog({
    localId: props.pathObj.localId,
    dirNames: {
      dirArrs: shareDirArr,
      fileArrs: shareObjArr
    }
  })
}
const download = async (fileName: string, download_url: string) => {
  // 创建a标签
  const a = document.createElement('a')
  // 定义下载名称
  a.download = fileName
  // 隐藏标签
  a.style.display = 'none'
  // 设置文件路径
  a.href = download_url
  // 将创建的标签插入dom
  document.body.appendChild(a)
  // 点击标签，执行下载
  a.click()
  // 将标签从dom移除
  document.body.removeChild(a)
  // const fileName = props.pathObj.localId + '/' + name
  // const res = await storage.storage.api.getObjPath({ path: { objpath: fileName } })
  // const url = window.URL.createObjectURL(new Blob([res.data]))
  // const link = document.createElement('a')
  // link.style.display = 'none'
  // link.href = url
  // link.setAttribute('download', name)
  // document.body.appendChild(link)
  // link.click()
  // document.body.removeChild(link)
  // 释放blob URL地址
  // window.URL.revokeObjectURL(url)
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
    <div class="row q-gutter-md">
      <q-btn class="col-auto" unelevated color="primary" label="创建文件夹"
             @click="store.triggerCreateFolderDialog({ dirName: props.pathObj.localId })"/>
      <q-btn class="col-auto" unelevated color="primary" label="上传文件"
             @click="store.triggerUploadDialog({ bucket_name: props.pathObj.localId })"/>
      <q-btn class="col-auto" unelevated color="primary" label="删除文件" @click="deleteFile"
             :disable="selected.length > 0 ? false : true"/>
      <q-btn class="col-auto" unelevated color="primary" label="公开分享" @click="shareFile"
             :disable="selected.length > 0 ? false : true"/>
    </div>

    <div class="row items-center q-gutter-sm q-py-sm text-grey">

      <div class="col-auto">
        <q-btn flat color="primary" padding="none" @click="navigateToUrl(upperPath)">返回上一级</q-btn>
      </div>

      <div class="col-auto">
        |
      </div>

      <q-breadcrumbs class="col-auto text-black">

        <template v-slot:separator>
          <q-icon
            size="xs"
            name="chevron_right"
            color="grey"
          />
        </template>

        <q-breadcrumbs-el @click="navigateToUrl('/my/storage/bucket')">
          <div class="row items-center no-wrap cursor-pointer">
            <q-icon class="col-auto" size="xs" color="yellow-8" name="mdi-database"/>
            <div class="col-auto">全部存储桶</div>
          </div>
        </q-breadcrumbs-el>

        <q-breadcrumbs-el @click="navigateToUrl('/my/storage/bucket/file?bucket=' + currentBucket)">
          <div class="row items-center no-wrap cursor-pointer">
            <q-icon class="col-auto" size="xs" color="yellow-8" name="mdi-database"/>
            <div class="col-auto" :class="arrayPaths?.length === 0 ? 'text-bold' : ''"> {{ currentBucket }}</div>
          </div>
        </q-breadcrumbs-el>

        <q-breadcrumbs-el v-for="(path, index) in arrayPaths?.slice(0, -1)" :key="path"
                          @click="navigateToUrl('/my/storage/bucket/file?bucket=' + currentBucket + '&path=' + currentPath?.split(arrayPaths[index + 1])[0].slice(0,-1))">
          <div class="row items-center no-wrap cursor-pointer">
            <q-icon class="col-auto" size="xs" color="yellow-8" name="folder"/>
            <div class="col-auto"> {{ clipText7(path) }}</div>
          </div>
        </q-breadcrumbs-el>

        <q-breadcrumbs-el v-if="arrayPaths?.length > 0">
          <div class="row items-center no-wrap">
            <q-icon class="col-auto" size="xs" color="yellow-8" name="folder"/>
            <div class="col-auto text-bold"> {{ clipText70(arrayPaths?.slice(-1)[0]) }}</div>
          </div>
        </q-breadcrumbs-el>

      </q-breadcrumbs>

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
          no-data-label="没有文件"
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
                <q-btn v-if="!props.row.fod" flat no-caps padding="none"
                       @click="navigateToUrl('/my/storage/bucket/file?bucket=' + currentBucket + '&path=' + (currentPath? currentPath + '/' : '') + props.row.name)">
                  <div class="row items-center no-wrap">
                    <q-icon class="col-auto" color="yellow-8" name="folder"/>
                    <div class="col-auto text-black"> {{ clipText70(props.row.name) }}</div>
                  </div>
                </q-btn>

                <q-btn v-if="props.row.fod" flat no-caps color="black" padding="none" :ripple="false">
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
                {{ props.row.access_permission }}
              </q-td>

              <q-td key="operation" :props="props">
                <q-btn-dropdown unelevated color="primary" label="操作" v-if="props.row.fod === false">
                  <q-list>
                    <q-item clickable v-close-popup @click="onItemClick(props.row.name, props.row.fod)">
                      <q-item-section>
                        <q-item-label>删除</q-item-label>
                      </q-item-section>
                    </q-item>
                    <q-item clickable v-close-popup @click="changeName(props.row.name)">
                      <q-item-section>
                        <q-item-label>重命名</q-item-label>
                      </q-item-section>
                    </q-item>
                    <q-item clickable v-close-popup @click="shareItemClick(props.row.name, props.row.access_code, props.row.fod)">
                      <q-item-section>
                        <q-item-label>公开分享</q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-btn-dropdown>
                <q-btn v-if="props.row.fod === true" class="q-pt-sm" unelevated dense color="primary" @click="toggleExpansion(props)"
                       :label="props.expand ? '折叠详情' : '展开详情'" :icon="props.expand ? 'expand_less' : 'expand_more'">
                </q-btn>
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
                      创建时间: {{ new Date(fileDetail[props.row.name]?.ult).toLocaleString(i18n.global.locale) }}
                    </div>
                    <div>
                      文件大小: {{ fileDetail[props.row.name]?.si }}
                    </div>
                    <div>
                      下载次数: {{ fileDetail[props.row.name]?.dlc }}
                    </div>
                  </div>
                  <div class="q-ml-xl">
                    <div>最后修改: {{ new Date(fileDetail[props.row.name]?.upt).toLocaleString(i18n.global.locale) }}</div>
                    <div>访问权限: {{ fileDetail[props.row.name]?.access_permission }}</div>
                    <div>MD5: {{ fileDetail[props.row.name]?.md5 }}</div>
                  </div>
                </div>
                <q-separator/>
                <div class="q-mt-xs">
                  <q-btn color="primary" unelevated @click="download(fileDetail[props.row.name]?.name, fileDetail[props.row.name]?.download_url)">下载</q-btn>
<!--                  <q-btn color="primary" unelevated @click="download(fileDetail[props.row.name].name)">下载</q-btn>-->
                  <q-btn class="q-ml-sm" color="primary" unelevated @click="onItemClick(fileDetail[props.row.name].name, fileDetail[props.row.name].fod)">删除</q-btn>
                  <q-btn class="q-ml-sm" color="primary" unelevated @click="changeName(fileDetail[props.row.name].name)">重命名</q-btn>
                  <q-btn class="q-ml-sm" color="primary" unelevated @click="shareItemClick(fileDetail[props.row.name].name, fileDetail[props.row.name].access_code, fileDetail[props.row.name].fod)">公开分享</q-btn>
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
