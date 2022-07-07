<script lang="ts" setup>
import { ref } from 'vue'
import { useStore } from 'stores/store'
import { Notify, useDialogPluginComponent } from 'quasar'
import storage from 'src/api/index'

const props = defineProps({
  bucket_name: {
    type: String,
    required: true
  },
  dirpath: {
    type: Object,
    required: true
  }
})
const store = useStore()
defineEmits([...useDialogPluginComponent.emits])

const {
  dialogRef,
  onDialogHide,
  onDialogOK,
  onDialogCancel
} = useDialogPluginComponent()
const isDisable = ref(false)
const onOKClick = async () => {
  const deleteDirArr: string[] = []
  const deleteFileArr: string[] = []
  const deleteFailArr: string[] = []
  isDisable.value = true
  if (props.dirpath.dirArrs && props.dirpath.dirArrs.length > 0) {
    for (const item of props.dirpath.dirArrs) {
      await storage.storage.api.deleteDirPath({ path: { dirpath: item, bucket_name: props.bucket_name } }).then(() => {
        deleteDirArr.push(item)
      }).catch((error) => {
        deleteFailArr.push(item)
        console.log(error)
      })
    }
  }
  if (props.dirpath.fileArrs && props.dirpath.fileArrs.length > 0) {
    for (const item of props.dirpath.fileArrs) {
      await storage.storage.api.deleteObjPath({ path: { objpath: item, bucket_name: props.bucket_name } }).then(() => {
        deleteFileArr.push(item)
      }).catch((error) => {
        console.log(error)
      })
    }
  }
  store.deleteFile({
    item: {
      bucket_name: props.bucket_name,
      dirpath: { dirArrs: deleteDirArr, fileArrs: deleteFileArr }
    }
  })
  if (deleteFailArr.length !== 0) {
    Notify.create({
      classes: 'notification-negative shadow-15',
      icon: 'check_circle',
      textColor: 'negative',
      message: deleteFailArr.toString() + '是非空目录，不能删除',
      position: 'bottom',
      closeBtn: true,
      timeout: 5000,
      multiLine: false
    })
  } else {
    Notify.create({
      classes: 'notification-positive shadow-15',
      icon: 'check_circle',
      textColor: 'positive',
      message: '删除成功',
      position: 'bottom',
      closeBtn: true,
      timeout: 5000,
      multiLine: false
    })
  }
  onDialogOK()
  isDisable.value = false
}
const onCancelClick = onDialogCancel

</script>

<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin dialog-primary">
      <div class="text-center"><h5>确认要删除吗？</h5></div>
      <div class="text-center"><h6>此操作是不可逆的！</h6></div>
      <q-card-actions align="center">
        <q-btn class="q-ma-sm" color="primary" label="确认" unelevated @click="onOKClick" :disable="isDisable"/>
        <q-btn class="q-ma-sm" color="primary" label="取消" unelevated @click="onCancelClick"/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style lang="scss" scoped>
</style>
