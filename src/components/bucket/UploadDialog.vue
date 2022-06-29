<script lang="ts" setup>
import { ref } from 'vue'
import { useStore } from 'stores/store'
import { useRoute } from 'vue-router'
import { Notify, useDialogPluginComponent } from 'quasar'
import storage from 'src/api/index'

const props = defineProps({
  bucket_name: {
    type: String,
    required: true
  }
})
const $route = useRoute()
const store = useStore()
defineEmits([...useDialogPluginComponent.emits])

const bucket = $route.query.bucket as string // string or undefined
const path = $route.query.path as string
const {
  dialogRef,
  onDialogHide,
  onDialogOK,
  onDialogCancel
} = useDialogPluginComponent()
const onCancelClick = onDialogCancel
let file: Record<string, File> | null = null
const isProgress = ref(false)
const progress = ref(0)
const factoryFn = async (files: Record<string, File>) => {
  console.log(files)
  isProgress.value = true
  const formData = new FormData()
  formData.append('file', files[0])
  await storage.storage.api.putObjPath({ path: { objpath: files[0].name, bucket_name: props.bucket_name }, body: { file: formData } })
  progress.value = 1
  void await store.addPathTable({ bucket, path })
  Notify.create({
    classes: 'notification-positive shadow-15',
    icon: 'check_circle',
    textColor: 'positive',
    message: '上传成功',
    position: 'bottom',
    closeBtn: true,
    timeout: 5000,
    multiLine: false
  })
  onDialogOK()
}
const addFile = (files: Record<string, File>) => {
  console.log(files)
  file = files
}
const removeFile = () => {
  isProgress.value = false
  file = null
}
const upload = () => {
  if (file !== null) {
    void factoryFn(file)
  } else {
    Notify.create({
      classes: 'notification-negative shadow-15',
      icon: 'las la-times-circle',
      textColor: 'negative',
      message: '请选择文件',
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
    <q-uploader
          :factory="factoryFn"
          @added="addFile"
          @removed="removeFile"
          label="上传文件"
          :headers="[{'Content-Type': 'multipart/form-data'}]"
          style="width: 450px"
        >
      <template v-slot:header="scope">
        <div class="row no-wrap items-center q-pa-sm q-gutter-xs">
          <q-btn v-if="scope.queuedFiles.length > 0" icon="clear_all" @click="scope.removeQueuedFiles" round dense flat >
            <q-tooltip>清空文件</q-tooltip>
          </q-btn>
          <q-spinner v-if="scope.isUploading" class="q-uploader__spinner" />
          <div class="col">
            <div class="q-uploader__title">上传文件</div>
            <div class="q-uploader__subtitle">{{ scope.uploadSizeLabel }} / {{ scope.uploadProgressLabel }}</div>
          </div>
          <q-btn v-if="scope.canAddFiles" type="a" icon="add_box" @click="scope.pickFiles" round dense flat>
            <q-uploader-add-trigger />
            <q-tooltip>选择文件</q-tooltip>
          </q-btn>
        </div>
      </template>
          <template v-slot:list="scope">
            <q-list separator>
<!--              <div>{{scope}}</div>-->
              <q-linear-progress :value="progress" color="secondary" class="q-mt-sm" v-if="isProgress"/>
              <q-item v-for="file in scope.files" :key="file.__key">
                <q-item-section>
                  <q-item-label class="full-width ellipsis">
                    {{ file.name }}
                  </q-item-label>
                  <q-item-label caption>
                    {{ file.__sizeLabel }} / {{ file.__progressLabel }}
                  </q-item-label>
                </q-item-section>
                <q-item-section top side>
                  <q-btn class="gt-xs" size="12px" flat dense round icon="delete" @click="scope.removeFile(file)">
                    <q-tooltip>删除文件</q-tooltip>
                  </q-btn>
                </q-item-section>
              </q-item>
            </q-list>
            <div class="row justify-center q-mt-xl">
              <q-btn class="q-ma-sm" color="primary" label="上传" unelevated @click="upload"/>
              <q-btn class="q-ma-sm" color="primary" label="取消" unelevated @click="onCancelClick"/>
            </div>
          </template>
        </q-uploader>
  </q-dialog>
</template>

<style lang="scss" scoped>
</style>
