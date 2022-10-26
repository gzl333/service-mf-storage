<script lang="ts" setup>
import { ref } from 'vue'
import { useStore } from 'stores/store'
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
console.log(props)
const store = useStore()
const { tc } = i18n.global
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
  const base = store.tables.serviceTable.byId[store.tables.bucketTable.byId[props.bucketId]?.service.id]?.endpoint_url
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
  if (props.dirpath.fileArrs && props.dirpath.fileArrs.length > 0) {
    for (const item of props.dirpath.fileArrs) {
      await api.storage.single.deleteObjPath({ base, path: { bucket_name: props.bucket_name, objpath: item.na } }).then(() => {
        deleteFileArr.push(item.name)
      }).catch((error) => {
        console.log(error)
      })
    }
  }
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
    if (props.isOperationStore) {
      store.deleteFile(
        {
          localId: props.localId,
          dirpath: {
            dirArrs: deleteDirArr,
            fileArrs: deleteFileArr
          }
        })
    } else {
      emitter.emit('done', true)
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
