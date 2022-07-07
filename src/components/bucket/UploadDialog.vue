<script lang="ts" setup>
import { Ref, ref } from 'vue'
import { useStore } from 'stores/store'
import { useRoute } from 'vue-router'
import { Notify, useDialogPluginComponent } from 'quasar'
import { axiosStorage } from 'boot/axios'
// import SparkMD5 from 'spark-md5'
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
const fileArr: Ref = ref([])
const progressArr: Ref = ref([])
const isUploading = ref(false)
const isProgress = ref(false)
const addFile = (files: string | File[]) => {
  for (const file of files) {
    fileArr.value.push(file)
  }
}
const clearFile = (index: string) => {
  fileArr.value.splice(index, 1)
}
const clearAll = () => {
  fileArr.value = []
}
// 计算MD5
// const getMD5 = async (file: File) => {
// 使用sparkMD5的ArrayBuffer类，读取二进制文件
// const spark = new SparkMD5.ArrayBuffer()
// const fileReader = new FileReader()
// 异步操作，读完后的结果
// fileReader.onload = async (e) => {
// 把文件开始传入spark
// spark.append(e.target.result)
// spark计算出MD5后的结果
// const _md5 = spark.end()
// console.log(_md5)
// }
// fileReader读取二进制文件
// fileReader.readAsArrayBuffer(file)
// }
// 上传完整文件不切片
const putObjPath = async (payload: { path: { objpath: string, bucket_name: string }, body: { file: File }, index: number }) => {
  const formData = new FormData()
  formData.append('file', payload.body.file)
  return axiosStorage({
    url: `/api/v1/obj/${payload.path.bucket_name}/${payload.path.objpath}/`,
    method: 'put',
    data: formData,
    onUploadProgress: function (progressEvent) {
      if (progressEvent.lengthComputable) {
        progressArr.value[payload.index] = Math.round(progressEvent.loaded / progressEvent.total * 100)
      }
    }
  })
}
// 切片上传文件
const postObjPath = async (payload: { path: { bucket_name: string, objpath: string }, query: { reset: boolean }, body: { file: File }, index: number }) => {
  const file = payload.body.file
  const chunkSize = 10 * 1024 * 1024
  let start = 0
  const fileName = file.name
  const fileSize = file.size
  const config = {
    params: payload?.query
  }
  for (let i = 0; i < fileSize; i += chunkSize) {
    let blob = null
    if (start + chunkSize > fileSize) {
      blob = file.slice(start, fileSize)
      start = fileSize
    } else {
      blob = file.slice(start, start + chunkSize)
      start += chunkSize
    }
    const blobFile = new File([blob], fileName)
    const formData = new FormData()
    formData.append('chunk', blobFile)
    formData.append('chunk_offset ', (start - blobFile.size).toString())
    formData.append('chunk_size', (blobFile.size).toString())
    if (i === 0) {
      await axiosStorage({
        url: `/api/v1/obj/${payload.path.bucket_name}/${payload.path.objpath}/`,
        method: 'post',
        data: formData,
        params: config
      })
      progressArr.value[payload.index] = Math.round(start / fileSize * 100)
    } else {
      await axiosStorage({
        url: `/api/v1/obj/${payload.path.bucket_name}/${payload.path.objpath}/`,
        method: 'post',
        data: formData
      })
      progressArr.value[payload.index] = Math.round(start / fileSize * 100)
    }
  }
  progressArr.value[payload.index] = 100
}

const factoryFn = async (files: File, index: number) => {
  // await getMD5(files, index)
  if (files.size / 1024 / 1024 > 500) {
    await postObjPath({ path: { objpath: files.name, bucket_name: props.bucket_name }, query: { reset: true }, body: { file: files }, index })
  } else {
    await putObjPath({ path: { objpath: files.name, bucket_name: props.bucket_name }, body: { file: files }, index })
  }
}
const upload = async () => {
  if (fileArr.value.length !== 0) {
    for (let index = 0; index < fileArr.value.length; index++) {
      progressArr.value[index] = 0
    }
    isUploading.value = true
    isProgress.value = true
    for (let index = 0; index < fileArr.value.length; index++) {
      void await factoryFn(fileArr.value[index], index)
    }
    onDialogOK()
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
    void await store.addPathTable({ bucket, path })
    fileArr.value = []
    isUploading.value = false
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
<!--  :headers="[{'Content-Type': 'multipart/form-data'}]"-->
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-uploader
      :factory="factoryFn"
      @added="addFile"
      label="上传文件"
      multiple
      style="width: 450px"
    >
      <template v-slot:header="scope">
        <div class="row no-wrap items-center q-pa-sm q-gutter-xs">
          <q-btn v-if="scope.queuedFiles.length > 0 && isUploading === false" icon="clear_all" @click="scope.removeQueuedFiles(); clearAll()" round dense flat>
            <q-tooltip>清空文件</q-tooltip>
          </q-btn>
          <q-spinner v-if="scope.queuedFiles.length > 0 && isUploading === true" class="q-uploader__spinner"/>
          <div class="col">
<!--            <div>{{scope}}</div>-->
            <div class="q-uploader__title">上传文件</div>
            <div class="q-uploader__subtitle">{{ scope.uploadSizeLabel }}</div>
          </div>
          <q-btn v-if="isUploading === false" type="a" icon="add_box" @click="scope.pickFiles" round dense flat>
            <q-uploader-add-trigger/>
            <q-tooltip>选择文件</q-tooltip>
          </q-btn>
        </div>
      </template>
      <template v-slot:list="scope">
        <q-list separator>
          <q-item v-for="(file, index) in scope.files" :key="file.__key">
            <q-item-section>
              <q-item-label class="full-width ellipsis">
                {{ file.name }}
              </q-item-label>
              <q-item-label caption>
                {{ file.__sizeLabel }}
              </q-item-label>
              <q-item-label>
                <div class="row" v-if="isProgress">
                  <div class="col-11">
                    <q-linear-progress :value="progressArr[index] / 100" color="primary" class="q-mt-sm" size="md"/>
                  </div>
                  <div class="col-1 text-center">{{progressArr[index]}}%</div>
                </div>
              </q-item-label>
            </q-item-section>
            <q-item-section top side>
              <q-btn class="gt-xs" size="12px" flat dense round icon="delete" @click="scope.removeFile(file); clearFile(index)" :disable="isUploading">
                <q-tooltip>删除文件</q-tooltip>
              </q-btn>
            </q-item-section>
          </q-item>
        </q-list>
        <div class="row justify-center q-mt-xl">
          <q-btn class="q-ma-sm" color="primary" label="上传" unelevated @click="upload" :disable="isUploading"/>
          <q-btn class="q-ma-sm" color="primary" label="取消" unelevated @click="onCancelClick"/>
        </div>
      </template>
    </q-uploader>
  </q-dialog>
</template>

<style lang="scss" scoped>
</style>
