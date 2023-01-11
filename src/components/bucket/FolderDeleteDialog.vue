<script lang="ts" setup>
import { ref } from 'vue'
import { useStore } from 'stores/store'
import { useRoute/* , useRouter */ } from 'vue-router'
import { Notify, useDialogPluginComponent } from 'quasar'
import { i18n } from 'boot/i18n'
import emitter from 'boot/mitt'
import api from 'src/api/index'

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
  dirpath: {
    type: Object,
    required: true
  },
  isOperationStore: {
    type: Boolean,
    required: false
  }
})
const store = useStore()
const { tc } = i18n.global
const route = useRoute()
defineEmits([...useDialogPluginComponent.emits])
const {
  dialogRef,
  onDialogHide,
  onDialogOK,
  onDialogCancel
} = useDialogPluginComponent()
const isDisable = ref(false)
const onOKClick = async () => {
  // 用于存放删除成功的文件夹
  const deleteDirArr: string[] = []
  // 用于存储删除成功的文件
  const deleteFileArr: string[] = []
  // 用处存储删除失败的文件夹以及文件
  const deleteFailArr: string[] = []
  isDisable.value = true
  const base = store.tables.serviceTable.byId[store.tables.bucketTable.byId[props.bucketId]?.service.id]?.endpoint_url
  // 批量删除删除文件夹
  if (props.dirpath.dirArrs && props.dirpath.dirArrs.length > 0) {
    for (const item of props.dirpath.dirArrs) {
      await api.storage.single.deleteDirPath({
        base,
        path: {
          bucket_name: props.bucket_name,
          dirpath: item.na
        }
      }).then(() => {
        deleteDirArr.push(item.name)
      }).catch((error) => {
        deleteFailArr.push(item.name)
        console.log(error)
      })
    }
  }
  // 批量删除删除文件
  if (props.dirpath.fileArrs && props.dirpath.fileArrs.length > 0) {
    for (const item of props.dirpath.fileArrs) {
      await api.storage.single.deleteObjPath({ base, path: { bucket_name: props.bucket_name, objpath: item.na } }).then(() => {
        deleteFileArr.push(item.name)
      }).catch((error) => {
        console.log(error)
      })
    }
  }
  // 如果该数组里有值说明存在删除失败的文件夹
  if (deleteFailArr.length !== 0) {
    Notify.create({
      classes: 'notification-negative shadow-15',
      icon: 'check_circle',
      textColor: 'negative',
      message: `${deleteFailArr.toString()} ${tc('是非空目录，不能删除')}`,
      position: 'bottom',
      closeBtn: true,
      timeout: 5000,
      multiLine: false
    })
  } else {
    // 从store中删除文件夹以及文件
    if (props.isOperationStore) {
      // store.deleteFile(
      //   {
      //     localId: props.localId,
      //     dirpath: {
      //       dirArrs: deleteDirArr,
      //       fileArrs: deleteFileArr
      //     }
      //   })
      void await store.addPathTable(
        props.bucketId,
        route.query.path as string,
        store.items.pathPage.limit,
        store.items.pathPage.offset
      )
    } else {
      // 综合检索页面刷新数据
      emitter.emit('refresh', true)
    }
    Notify.create({
      classes: 'notification-positive shadow-15',
      icon: 'check_circle',
      textColor: 'positive',
      message: `${tc('删除成功')}`,
      position: 'bottom',
      closeBtn: true,
      timeout: 5000,
      multiLine: false
    })
    onDialogOK()
    isDisable.value = false
  }
}
const onCancelClick = onDialogCancel

</script>

<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin dialog-primary">
      <div class="text-center"><h5>{{ tc('确认要删除吗') }}？</h5></div>
      <div class="text-center"><h6>{{ tc('此操作是不可逆的') }}！</h6></div>
      <q-card-actions align="center">
        <q-btn class="q-ma-sm" color="primary" :label="tc('确认')" no-caps unelevated @click="onOKClick"
               :disable="isDisable"/>
        <q-btn class="q-ma-sm" color="primary" :label="tc('取消')" no-caps unelevated @click="onCancelClick"/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style lang="scss" scoped>
</style>
