<script lang="ts" setup>
import { ref } from 'vue'
import { FileInterface, useStore } from 'stores/store'
import { Notify, QInput, useDialogPluginComponent } from 'quasar'
import { i18n } from 'boot/i18n'
import api from 'src/api'
import $bus from 'src/hooks/bus'

const props = defineProps({
  bucketId: {
    type: String,
    required: true
  },
  objpath: {
    type: String,
    required: true
  }
})

interface BreadcrumbsInterface {
  name: string
  na: string
}

const store = useStore()
const { tc } = i18n.global
const inputRef = ref<QInput>()
defineEmits([...useDialogPluginComponent.emits])
const {
  dialogRef,
  onDialogHide,
  onDialogOK,
  onDialogCancel
} = useDialogPluginComponent()
const bucket = store.tables.bucketTable.byId[props.bucketId]
const base = store.tables.serviceTable.byId[bucket.service.id]?.endpoint_url
const movePath = ref('')
const dirList = ref<FileInterface[]>([])
const breadcrumbsArr = ref<BreadcrumbsInterface[]>([])
const isFinishedAll = ref('')
const scrollIndex = ref(0)
const getRootPathDirList = async () => {
  movePath.value = '/'
  breadcrumbsArr.value = []
  const respGetDirBucket = await api.storage.single.getDirBucketName({
    base,
    query: { limit: 100, offset: 0 },
    path: { bucket_name: bucket.name }
  })
  dirList.value = respGetDirBucket.data.files.filter((item: FileInterface) => !item.fod)
  scrollIndex.value = dirList.value.length
  if (respGetDirBucket.data.count === respGetDirBucket.data.files.length) {
    isFinishedAll.value = 'all'
  } else {
    isFinishedAll.value = 'not'
  }
}
void getRootPathDirList()
const getNextLevelDirList = async (name: string, na: string) => {
  movePath.value = na
  breadcrumbsArr.value.push({ name, na })
  const respGetDirPath = await api.storage.single.getDirBucketNameDirPath({
    base,
    query: {
      limit: 100,
      offset: 0
    },
    path: {
      bucket_name: bucket.name,
      dirpath: na
    }
  })
  dirList.value = respGetDirPath.data.files.filter((item: FileInterface) => !item.fod)
  scrollIndex.value = dirList.value.length
  if (respGetDirPath.data.count === respGetDirPath.data.files.length) {
    isFinishedAll.value = 'all'
  } else {
    isFinishedAll.value = 'not'
  }
}
const getLastLevelDirList = async (na: string, index: number) => {
  movePath.value = na
  if (index + 1 < breadcrumbsArr.value.length) {
    breadcrumbsArr.value.splice(index + 1)
  }
  const respGetDirPath = await api.storage.single.getDirBucketNameDirPath({
    base,
    query: {
      limit: 100,
      offset: 0
    },
    path: {
      bucket_name: bucket.name,
      dirpath: na
    }
  })
  dirList.value = respGetDirPath.data.files.filter((item: FileInterface) => !item.fod)
  scrollIndex.value = dirList.value.length
  if (respGetDirPath.data.count === respGetDirPath.data.files.length) {
    isFinishedAll.value = 'all'
  } else {
    isFinishedAll.value = 'not'
  }
}
const rollingLoadData = async (index: number) => {
  if (movePath.value === '/') {
    const respGetDirBucket = await api.storage.single.getDirBucketName({
      base,
      query: { limit: 100, offset: index * 100 },
      path: { bucket_name: bucket.name }
    })
    const filterRootDir = respGetDirBucket.data.files.filter((item: FileInterface) => !item.fod)
    filterRootDir.forEach((item: FileInterface) => {
      dirList.value.push(item)
    })
    scrollIndex.value = dirList.value.length
  } else {
    const respGetDirPath1 = await api.storage.single.getDirBucketNameDirPath({
      base,
      query: {
        limit: 100,
        offset: index * 100
      },
      path: {
        bucket_name: bucket.name,
        dirpath: movePath.value
      }
    })
    const filterPathDir = respGetDirPath1.data.files.filter((item: FileInterface) => !item.fod)
    filterPathDir.forEach((item: FileInterface) => {
      dirList.value.push(item)
    })
    scrollIndex.value = dirList.value.length
  }
}
let loadNum = 1
const scrolling = async (details: Record<string, never>) => {
  if (isFinishedAll.value === 'not') {
    if (details.index + 1 === scrollIndex.value) {
      await rollingLoadData(loadNum)
      loadNum++
    }
  }
}
const onOKClick = async () => {
  Notify.create({
    classes: 'notification-positive shadow-15',
    icon: 'las la-redo-alt',
    textColor: 'positive',
    message: `${tc('正在移动中')}`,
    position: 'bottom',
    closeBtn: true,
    timeout: 5000,
    multiLine: false
  })
  try {
    const base = store.tables.serviceTable.byId[store.tables.bucketTable.byId[props.bucketId]?.service?.id]?.endpoint_url
    const renameRes = await api.storage.single.postObjPath({
      base,
      path: { bucket_name: bucket.name, objpath: props.objpath },
      query: { move_to: movePath.value }
    })
    if (renameRes.status === 201) {
      $bus.emit('refreshPaginationTable', true)
    }
    Notify.create({
      classes: 'notification-positive shadow-15',
      icon: 'check_circle',
      textColor: 'positive',
      message: `${tc('文件移动成功')}`,
      position: 'bottom',
      closeBtn: true,
      timeout: 5000,
      multiLine: false
    })
    onDialogOK()
  } catch (error: unknown) {
    inputRef.value!.focus()
  }
}
const onCancelClick = onDialogCancel
</script>

<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin dialog-primary row column justify-between" style="height: 470px">
      <div>
        <q-card-section class="row items-center justify-center q-pb-md">
          <div class="text-primary">
            {{ tc('移动到') }}
          </div>
          <q-space/>
          <q-btn icon="close" flat dense size="sm" v-close-popup/>
        </q-card-section>
        <q-separator/>
        <q-card-section>
          <q-breadcrumbs class="text-grey-8 text-caption">
            <q-breadcrumbs-el class="cursor-pointer" label="全部文件" @click="getRootPathDirList"/>
            <q-breadcrumbs-el class="cursor-pointer" v-for="(item, index) in breadcrumbsArr" :key="index"
                              @click="getLastLevelDirList(item.na, index)">
              <span>{{ item.name }}</span>
            </q-breadcrumbs-el>
          </q-breadcrumbs>
          <div v-if="dirList.length > 0" class="q-py-xs">
            <q-virtual-scroll
              type="table"
              class="no-shadow"
              style="max-height: 30vh"
              :items="dirList"
              separator
              v-slot="{ item: row, index }"
              @virtual-scroll="scrolling"
            >
              <tr :key="index">
                <td>
                  <q-btn class="q-mr-md" flat no-caps padding="none">
                    <div class="row items-center no-wrap" @click="getNextLevelDirList(row.name, row.na)">
                      <q-icon class="col-auto" color="yellow-8" name="folder"/>
                      <div class="col-auto text-black"> {{ row.name }}</div>
                    </div>
                  </q-btn>
                </td>
              </tr>
            </q-virtual-scroll>
            <q-separator/>
          </div>
          <div v-else class="text-center q-pt-xl q-mt-xl">
            <q-icon class="col-auto" color="yellow-8" name="folder" size="xl"/>
            <div>移动到此文件夹中</div>
          </div>
        </q-card-section>
      </div>
      <q-card-actions align="between">
        <q-btn class="q-ml-sm" color="primary" :label="tc('移动')" no-caps unelevated @click="onOKClick"/>
        <q-btn class="q-mr-sm" color="primary" :label="tc('取消')" no-caps unelevated @click="onCancelClick"/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style lang="scss" scoped>
</style>
