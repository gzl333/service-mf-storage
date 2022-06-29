<script lang="ts" setup>
import { ref, Ref } from 'vue'
import { i18n } from 'boot/i18n'
import useClipText from 'src/hooks/useClipText'
import useFormatSize from 'src/hooks/useFormatSize'
import storage from 'src/api/index'
import { useRoute } from 'vue-router'

const props = defineProps({
  pathObj: {
    type: Object,
    required: true
  }
})
const $route = useRoute()
const clipText70 = useClipText(70)
const formatSize1024 = useFormatSize(1024)
const tableRow = ref([])
const selected = ref([])
const breadArr: Ref = ref([])
const sign = ref(false)
const shareBase = $route.path.slice(9)
let password: unknown
const columns = [
  { name: 'name', align: 'left', label: '名称', field: 'name', sortable: true },
  { name: 'time', align: 'center', label: '上传时间', field: 'time', sortable: true },
  { name: 'size', align: 'center', label: '大小', field: 'size' },
  { name: 'operation', align: 'center', label: '操作', field: 'operation' }
]

const next = async (na: string) => {
  sign.value = true
  const breadObj: Record<string, string> = {}
  const path = na.slice(4)
  if ($route.query.p) {
    password = $route.query.p
    const resShareBase = await storage.storage.api.getShareBase({ path: { share_base: shareBase }, query: { p: password, subpath: path } })
    if (resShareBase.data.code === 200) {
      tableRow.value = resShareBase.data.files
      breadObj.name = resShareBase.data.subpath.substring(resShareBase.data.subpath.length - 3)
      breadObj.subpath = resShareBase.data.subpath
      breadArr.value.push(breadObj)
    }
  } else {
    const resShareBase = await storage.storage.api.getShareBase({ path: { share_base: shareBase }, query: { subpath: path } })
    if (resShareBase.data.code === 200) {
      tableRow.value = resShareBase.data.files
      breadObj.name = resShareBase.data.subpath.substring(resShareBase.data.subpath.length - 3)
      breadObj.subpath = resShareBase.data.subpath
      breadArr.value.push(breadObj)
    }
  }
}

const goBack = async (path: string, index: number) => {
  sign.value = true
  if ($route.query.p) {
    password = $route.query.p
    const resShareBase = await storage.storage.api.getShareBase({ path: { share_base: shareBase }, query: { p: password, subpath: path } })
    if (resShareBase.data.code === 200) {
      tableRow.value = resShareBase.data.files
      breadArr.value = breadArr.value.slice(0, index + 1)
      selected.value = []
    }
  } else {
    const resShareBase = await storage.storage.api.getShareBase({ path: { share_base: shareBase }, query: { subpath: path } })
    if (resShareBase.data.code === 200) {
      tableRow.value = resShareBase.data.files
      breadArr.value = breadArr.value.slice(0, index + 1)
      selected.value = []
    }
  }
}
const goHome = async () => {
  if ($route.query.p) {
    password = $route.query.p
    const resShareBase = await storage.storage.api.getShareBase({ path: { share_base: shareBase }, query: { p: password } })
    if (resShareBase.data.code === 200) {
      tableRow.value = resShareBase.data.files
      breadArr.value = []
      selected.value = []
    }
  } else {
    const resShareBase = await storage.storage.api.getShareBase({ path: { share_base: shareBase } })
    if (resShareBase.data.code === 200) {
      tableRow.value = resShareBase.data.files
      breadArr.value = []
      selected.value = []
    }
  }
}
const download = async (name: string) => {
  let resData
  if ($route.query.p) {
    const password: string | undefined = $route.query.p
    resData = await storage.storage.api.getSdShareBase({ path: { share_base: shareBase }, query: { subpath: name, p: password } })
  } else {
    resData = await storage.storage.api.getSdShareBase({ path: { share_base: shareBase }, query: { subpath: name } })
  }
  if (resData.status === 200) {
    const url = window.URL.createObjectURL(new Blob([resData.data]))
    const link = document.createElement('a')
    link.style.display = 'none'
    link.href = url
    link.setAttribute('download', name)
    document.body.appendChild(link)
    link.click()
  }
}
</script>

<template>
  <div class="ShareTable">
      <q-breadcrumbs active-color="white" style="font-size: 15px" class="q-mt-md text-black breadcrumbs ">
        <q-breadcrumbs-el class="text-bold" @click="goHome">
          <div class="row items-center no-wrap">
          <q-icon name="border_all" class="text-orange" size="23px" />
          <div class="col-auto">全部文件</div>
          </div>
        </q-breadcrumbs-el>
        <q-breadcrumbs-el v-for="(item, index) in breadArr" :key="index" class="text-bold" @click="goBack(item.subpath, index)">
          <div class="row items-center no-wrap">
            <q-icon name="folder_open" class="text-orange" size="23px" />
            <div class="col-auto">{{item.name}}</div>
          </div>
        </q-breadcrumbs-el>
      </q-breadcrumbs>
<!--    <div>{{props.pathObj}}</div>-->
    <q-table
      class="rounded-borders q-mt-sm"
      flat
      square
      table-header-class="bg-grey-1 text-grey"
      :rows="sign === false ? props.pathObj : tableRow"
      :columns="columns"
      row-key="name"
      hide-pagination
      no-data-label="没有文件"
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
            <q-btn v-if="!props.row.fod" flat no-caps padding="none" @click="next(props.row.na)">
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
            <q-btn-dropdown label="操作">
              <q-list>
                <q-item clickable v-close-popup v-if="props.row.fod" @click="download(props.row.name)">
                  <q-item-section>
                    <q-item-label>下载</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </div>
</template>

<style lang="scss" scoped>
.ShareTable {
  .breadcrumbs {
    cursor: pointer
  }
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
