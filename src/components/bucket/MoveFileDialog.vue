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
  localId: {
    type: String,
    required: true
  },
  bucket_name: {
    type: String,
    required: true
  },
  objpath: {
    type: String,
    required: true
  },
  isOperationStore: {
    type: Boolean,
    required: false
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
// const serviceOptions = ref<string[]>(store.items.allFolderPath)
const model1 = ref('')
const tableRow = ref([])
const bucket = store.tables.bucketTable.byId[props.bucketId]
const base = store.tables.serviceTable.byId[bucket.service.id]?.endpoint_url
const breadcrumbsArr = ref<BreadcrumbsInterface[]>([])
// let count = 0
const getData = async () => {
  model1.value = '/'
  breadcrumbsArr.value = []
  const respGetDirBucket = await api.storage.single.getDirBucketName({
    base,
    query: { limit: 100, offset: 0 },
    path: { bucket_name: bucket.name }
  })
  tableRow.value = respGetDirBucket.data.files.filter((item: FileInterface) => !item.fod)
  // count = respGetDirBucket.data.count
}
getData()
const goToNext = async (name: string, na: string) => {
  model1.value = na
  breadcrumbsArr.value.push({ name, na })
  const respGetDirPath1 = await api.storage.single.getDirBucketNameDirPath({
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
  tableRow.value = respGetDirPath1.data.files.filter((item: FileInterface) => !item.fod)
  // count = respGetDirPath1.data.count
}
const goToLast = async (na: string, index: number) => {
  model1.value = na
  if (index + 1 < breadcrumbsArr.value.length) {
    breadcrumbsArr.value.splice(index + 1)
  }
  const respGetDirPath1 = await api.storage.single.getDirBucketNameDirPath({
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
  tableRow.value = respGetDirPath1.data.files.filter((item: FileInterface) => !item.fod)
  // count = respGetDirPath1.data.count
}
// const changePage = async () => {
//   console.log(count)
//   console.log(model1.value)
//   count / 100 =49.97 = 50
//   offset = offset + 100
//   if (offset <= count) {
//     // if (model1.value === '/') {
//     //   const respGetDirBucket = await api.storage.single.getDirBucketName({
//     //     base,
//     //     query: { limit: 100, offset: 0 },
//     //     path: { bucket_name: bucket.name }
//     //   })
//     // } else {
//     //
//     // }
//   } else {
//
//   }
//
// }
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
    const renameRes = await api.storage.single.postObjPath({ base, path: { bucket_name: props.bucket_name, objpath: props.objpath }, query: { move_to: model1.value } })
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
// const filterFn = (val: string, update: (arg0: { (): void; (): void; }) => void) => {
//   if (val === '') {
//     update(() => {
//       serviceOptions.value = store.items.allFolderPath
//     })
//     return
//   }
//   update(() => {
//     const needle = val.toLowerCase()
//     serviceOptions.value = store.items.allFolderPath.filter(dir => dir.toLowerCase().indexOf(needle) !== -1)
//   })
// }
</script>

<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin dialog-primary">
      <q-card-section class="row items-center justify-center q-pb-md">
        <div class="text-primary">
          {{ tc('移动到') }}
        </div>
        <q-space/>
        <q-btn icon="close" flat dense size="sm" v-close-popup/>
      </q-card-section>
      <q-separator/>
      <q-card-section>
        <div class="row justify-between">
          <q-breadcrumbs class="text-grey-8 text-caption">
            <q-breadcrumbs-el class="cursor-pointer" label="全部文件" @click="getData"/>
            <q-breadcrumbs-el class="cursor-pointer" v-for="(item, index) in breadcrumbsArr" :key="index" @click="goToLast(item.na, index)">
              <span>{{ item.name }}</span>
            </q-breadcrumbs-el>
          </q-breadcrumbs>
          <div class="row items-center">
            <q-icon name="las la-sync-alt"></q-icon>
<!--            <div class="text-grey-8 text-caption cursor-pointer" @click="changePage">下一页</div>-->
          </div>
        </div>
        <div v-if="tableRow.length > 0" class="q-py-xs">
          <q-virtual-scroll
            type="table"
            class="no-shadow"
            style="max-height: 40vh"
            :items="tableRow"
            separator
            v-slot="{ item: row, index }"
          >
            <tr :key="index">
              <td>
                <q-btn class="q-mr-md" flat no-caps padding="none">
                  <div class="row items-center no-wrap" @click="goToNext(row.name, row.na)">
                    <q-icon class="col-auto" color="yellow-8" name="folder"/>
                    <div class="col-auto text-black"> {{ row.name }}</div>
                  </div>
                </q-btn>
              </td>
            </tr>
          </q-virtual-scroll>
          <q-separator/>
        </div>
        <div v-else class="text-center text-h6 q-py-xl">移动到此文件夹中</div>
      </q-card-section>
      <q-card-actions align="between">
        <q-btn class="q-ma-sm" color="primary" :label="tc('移动')" no-caps unelevated @click="onOKClick"/>
        <q-btn class="q-ma-sm" color="primary" :label="tc('取消')" no-caps unelevated @click="onCancelClick"/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style lang="scss" scoped>
</style>
