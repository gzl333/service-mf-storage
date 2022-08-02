<script lang="ts" setup>
import { computed, Ref, ref } from 'vue'
import { useRoute } from 'vue-router'
import { navigateToUrl } from 'single-spa'
import { i18n } from 'boot/i18n'
import { Notify } from 'quasar'
import useClipText from 'src/hooks/useClipText'
import useFormatSize from 'src/hooks/useFormatSize'

// import storage from 'src/api/index'

const props = defineProps({
  pathObj: {
    type: Object,
    required: true
  }
})

const { tc } = i18n.global
const route = useRoute()
// const shareBase = route.query.base as string // string or undefined
const password = route.query.p as string
const currentBucket = computed(() => props.pathObj?.share_base)
const currentPath = computed(() => props.pathObj?.subpath)
const arrayPaths = computed(() => props.pathObj?.subpath?.split('/')[0] === '' ? [] : props.pathObj?.subpath?.split('/'))
const selected: Ref = ref([])
const clipText70 = useClipText(70)
const formatSize1024 = useFormatSize(1024)
// 接收url结构： siteURL/(serviceId/)?base=xxx&sub=xxx&p=xxx
const columns = computed(() =>
  [
    { name: 'name', align: 'left', label: (() => tc('文件名称'))(), field: 'name', sortable: true },
    { name: 'time', align: 'center', label: (() => tc('上传时间'))(), field: 'time', sortable: true },
    { name: 'size', align: 'center', label: (() => tc('大小'))(), field: 'size' },
    { name: 'operation', align: 'center', label: (() => tc('操作'))(), field: 'operation' }
  ]
)

const goNext = async (na: string) => {
  const path = na.slice(4)
  if (password) {
    navigateToUrl('/storage/share/?base=' + route.query.base + '&sub=' + path + '&p=' + password)
  } else {
    navigateToUrl('/storage/share/?base=' + route.query.base + '&sub=' + path)
  }
}

const goBack = async (path: string, index: number) => {
  if (index + 1 !== arrayPaths.value.length) {
    if (password) {
      navigateToUrl('/storage/share/?base=' + currentBucket.value + '&sub=' + currentPath.value?.split(arrayPaths.value[index + 1])[0].slice(0, -1) + '&p=' + password)
    } else {
      navigateToUrl('/storage/share/?base=' + currentBucket.value + '&sub=' + currentPath.value?.split(arrayPaths.value[index + 1])[0].slice(0, -1))
    }
  }
}
const goAllFile = async () => {
  if (password) {
    navigateToUrl('/storage/share/?base=' + route.query.base + '&p=' + password)
  } else {
    navigateToUrl('/storage/share/?base=' + route.query.base)
  }
}
const batchDownload = () => {
  if (selected.value.length > 0) {
    for (const file of selected.value) {
      if (file.fod) {
        download(file.download_url)
      }
    }
  } else {
    Notify.create({
      classes: 'notification-negative shadow-15',
      icon: 'las la-times-circle',
      textColor: 'negative',
      message: tc('请先选择文件'),
      position: 'bottom',
      closeBtn: true,
      timeout: 5000,
      multiLine: false
    })
  }
}
const download = (download_url: string) => {
  // 通过api接口下载
  // let resData
  // if (route.query.p) {
  //   resData = await storage.storage.api.getSdShareBase({ path: { share_base: shareBase }, query: { subpath: name, p: password } })
  // } else {
  //   resData = await storage.storage.api.getSdShareBase({ path: { share_base: shareBase }, query: { subpath: name } })
  // }
  // if (resData.status === 200) {
  //   const url = window.URL.createObjectURL(new Blob([resData.data]))
  //   const link = document.createElement('a')
  //   link.style.display = 'none'
  //   link.href = url
  //   link.setAttribute('download', name)
  //   document.body.appendChild(link)
  //   link.click()
  // }

  // 通过url下载
  // 创建a标签
  // 可以下载单个文件，也可以批量下载。必须使用iframe，不能使用a标签，否则只会下载最后一个文件
  // 判断可能是执行到后面的时候，前面的a标签已经被移除了，
  // 使用iframe的方式挂载到windows上，然后使用延时器5分钟移除。
  const iframe = document.createElement('iframe')
  // 隐藏标签
  iframe.style.display = 'none'
  // 防止影响页面
  iframe.style.height = '0'
  // 设置文件路径
  iframe.src = download_url
  // 将创建的标签插入dom
  document.body.appendChild(iframe)
  // 点击标签，执行下载
  iframe.click()
  setTimeout(() => {
    // 将标签从dom移除
    iframe.remove()
  }, 5 * 60 * 1000)
}
</script>

<template>
  <div class="ShareTable">
    <div>
      <q-btn color="primary" unelevated no-caps @click="batchDownload">{{ tc('批量下载') }}</q-btn>
    </div>
    <div class="row justify-between items-center q-gutter-sm q-py-sm text-grey">
      <q-breadcrumbs class="col-auto text-black breadcrumbs">
        <q-breadcrumbs-el @click="goAllFile">
          <div class="row items-center no-wrap cursor-pointer">
            <q-icon class="col-auto" name="las la-file-alt" color="yellow-8" size="xs"/>
            <div :class="arrayPaths?.length === 0 ? 'col-auto text-weight-bold' : ''">{{ tc('全部文件') }}</div>
          </div>
        </q-breadcrumbs-el>
        <q-breadcrumbs-el v-for="(item, index) in arrayPaths" :key="index" @click="goBack(item.subpath, index)">
          <div
            :class="index + 1 !== arrayPaths?.length ? 'row items-center no-wrap cursor-pointer' : 'row items-center no-wrap'">
            <q-icon class="col-auto" name="las la-file-alt" color="yellow-8" size="xs"/>
            <div :class="index + 1 === arrayPaths?.length ? 'text-weight-bold' : ''">{{ item }}</div>
          </div>
        </q-breadcrumbs-el>
      </q-breadcrumbs>
    </div>
    <q-table
      class="rounded-borders q-mt-sm"
      flat
      square
      table-header-class="bg-grey-1 text-grey"
      :rows="props.pathObj?.files"
      :columns="columns"
      row-key="name"
      hide-pagination
      :no-data-label="tc('没有文件')"
      selection="multiple"
      v-model:selected="selected"
    >
      <template v-slot:header-selection="scope">
        <q-checkbox style="" v-model="scope.selected" dense size="xs"/>
      </template>
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td auto-width>
            <q-checkbox v-model="props.selected" dense size="xs"/>
          </q-td>
          <q-td key="name" :props="props">
            <q-btn v-if="!props.row.fod" flat no-caps padding="none" @click="goNext(props.row.na)">
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
          <q-td key="operation" :props="props">
            <q-btn v-if="props.row.fod" class="q-ml-xs" color="primary" unelevated no-caps
                   @click="download(props.row.download_url)">{{ tc('下载') }}
            </q-btn>
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </div>
</template>

<style lang="scss" scoped>
.ShareTable {
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
