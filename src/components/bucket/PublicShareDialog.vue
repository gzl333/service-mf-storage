<script lang="ts" setup>
import { ref, Ref } from 'vue'
import { useStore } from 'stores/store'
import { Notify, useDialogPluginComponent } from 'quasar'
import storage from 'src/api/index'
// import { useRoute } from 'vue-router'
import { i18n } from 'boot/i18n'

const props = defineProps({
  bucket_name: {
    type: String,
    required: true
  },
  pathObj: {
    type: Object,
    required: true
  }
})
const store = useStore()
// const $route = useRoute()
const tc = i18n.global.tc
defineEmits([...useDialogPluginComponent.emits])
const {
  dialogRef,
  onDialogHide,
  onDialogOK,
  onDialogCancel
} = useDialogPluginComponent()
// const bucket = $route.query.bucket as string // string or undefined
// const path = $route.query.path as string
const onCancelClick = onDialogCancel
const selectModel = ref(null)
const isPass = ref(false)
const options = [
  { label: '私有', value: -1, share: 0 },
  { label: '1天', value: 1, share: 1 },
  { label: '7天', value: 7, share: 1 },
  { label: '30天', value: 30, share: 1 },
  { label: '永久公开', value: 0, share: 1 }
]
const shareQuery: Ref = ref({
  share: '',
  days: ''
})
const selectFun = (val: Record<string, string>) => {
  if (val !== null) {
    shareQuery.value.share = val.share
    shareQuery.value.days = val.value
  }
}
const isHavePass = (value: boolean) => {
  isPass.value = value
}

const share = async () => {
  Notify.create({
    classes: 'notification-positive shadow-15',
    icon: 'las la-redo-alt',
    textColor: 'positive',
    message: '正在分享中',
    position: 'bottom',
    closeBtn: true,
    timeout: 5000,
    multiLine: false
  })
  if (selectModel.value !== null) {
    if (props.pathObj.dirArrs && props.pathObj.dirArrs.length > 0) {
      if (isPass.value === false) {
        for (const item of props.pathObj.dirArrs) {
          void await storage.storage.api.patchDirPath({
            path: { bucket_name: props.bucket_name, dirpath: item },
            query: { share: shareQuery.value.share, days: shareQuery.value.days }
          })
        }
      } else {
        for (const item of props.pathObj.dirArrs) {
          void await storage.storage.api.patchDirPath({
            path: { bucket_name: props.bucket_name, dirpath: item },
            query: { share: shareQuery.value.share, days: shareQuery.value.days, password: '' }
          })
        }
      }
    }
    if (props.pathObj.fileArrs && props.pathObj.fileArrs.length > 0) {
      if (isPass.value === false) {
        for (const item of props.pathObj.fileArrs) {
          void await storage.storage.api.patchObjPath({
            path: { bucket_name: props.bucket_name, objpath: item },
            query: { share: shareQuery.value.share, days: shareQuery.value.days }
          })
        }
      } else {
        for (const item of props.pathObj.fileArrs) {
          void await storage.storage.api.patchObjPath({
            path: { bucket_name: props.bucket_name, objpath: item },
            query: { share: shareQuery.value.share, days: shareQuery.value.days, password: '' }
          })
        }
      }
    }
    // void await store.addPathTable({ bucket, path })
    void store.changeShareStatus({ item: { bucket_name: props.bucket_name, dirpath: { dirArrs: props.pathObj.dirArrs, fileArrs: props.pathObj.fileArrs }, share: shareQuery.value.share } })
    Notify.create({
      classes: 'notification-positive shadow-15',
      icon: 'check_circle',
      textColor: 'positive',
      message: '分享成功',
      position: 'bottom',
      closeBtn: true,
      timeout: 5000,
      multiLine: false
    })
    onDialogOK()
  } else {
    Notify.create({
      classes: 'notification-negative shadow-15',
      icon: 'check_circle',
      textColor: 'negative',
      message: '请选择分享权限',
      position: 'bottom',
      closeBtn: true,
      timeout: 5000,
      multiLine: false
    })
  }
}
</script>

<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin dialog-primary">
      <q-card-section class="row items-center justify-center q-pb-md">
        <div class="text-primary">
          {{ tc('分享') }}
        </div>
        <q-space/>
        <q-btn icon="close" flat dense size="sm" v-close-popup/>
      </q-card-section>
      <q-separator/>
      <q-card-section>
        <div class="row justify-center">
          <q-select class="col-6" clearable outlined v-model="selectModel" :options="options" @update:model-value="selectFun" label="请选择"/>
        </div>
        <div class="row justify-center q-mt-md">
          <q-checkbox v-model="isPass" @update:model-value="isHavePass" label="有分享密码保护"/>
        </div>
        <div class="row justify-center q-mt-lg">
          <q-btn class="q-ma-sm" color="primary" label="分享" unelevated @click="share"/>
          <q-btn class="q-ma-sm" color="primary" label="取消" unelevated @click="onCancelClick"/>
        </div>
      </q-card-section>
      <q-separator/>
      <div class="text-center q-pa-md">
        提示：创建新的带密码的分享，旧的分享密码会失效
      </div>
    </q-card>
  </q-dialog>
</template>

<style lang="scss" scoped>
</style>
