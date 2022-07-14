<script lang="ts" setup>
import { Ref, ref } from 'vue'
import { useStore } from 'stores/store'
import { useRoute } from 'vue-router'
import { Notify, useDialogPluginComponent } from 'quasar'
import { axiosStorage } from 'boot/axios'
import { FloatSub } from 'src/hooks/handleFloat'
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
const uploadSpeed: Ref = ref()
const uploadTime: Ref = ref()
const isUploading = ref(false)
// 上一次计算时间
let lastTime = 0
// 上一次计算的文件大小
let lastSize = 0
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
// const cancel = () => {
//   cancelUpload()
// }
// 计算MD5
// const getMD5 = async (file: File, index: number) => {
// 使用sparkMD5的ArrayBuffer类，读取二进制文件
//   const spark = new SparkMD5.ArrayBuffer()
//   const fileReader = new FileReader()
//   fileReader.readAsArrayBuffer(file)
// 异步操作，读完后的结果
// fileReader.onload = async (e: any) => {
// 把文件开始传入spark
// await spark.append(e.target.result)
// spark计算出MD5后的结果
// const md5 = spark.end()
// await console.log(md5)
// await console.log(e.target.result)
// await putObjPath({ path: { objpath: file.name, bucket_name: props.bucket_name }, body: { file: e.target.result }, index, md5 })
// }
// fileReader读取二进制文件
// await fileReader.readAsArrayBuffer(file)
// }
const handleTime = (time: number) => {
  // 超过一小时
  if (time / 60 / 60 > 1) {
    const intHour = parseInt((time / 60 / 60).toString())
    const floatHour = parseFloat((time / 60 / 60).toFixed(1))
    const num = FloatSub(floatHour, intHour)
    const min = num * 60
    if (intHour < 24) {
      return intHour + '小时' + min + '分钟'
    } else {
      return '超过一天'
    }
    //  超过一分钟
  } else if (time / 60 > 1) {
    const intMin = parseInt((time / 60).toString())
    const floatMin = parseFloat((time / 60).toFixed(1))
    const num = FloatSub(floatMin, intMin)
    const sec = num * 60
    return intMin + '分钟' + sec + '秒'
  } else {
    const sec = parseInt(time.toString())
    if (sec > 0) {
      return sec + '秒'
    } else {
      return 0 + '秒'
    }
  }
}
const calcSpeedTime = (event: ProgressEvent, size?: number) => {
  // 计算间隔
  const nowTime = new Date().getTime()
  // 时间单位为毫秒，需转化为秒
  const intervalTime = (nowTime - lastTime) / 1000
  const intervalSize = event.loaded - lastSize
  // 重新赋值以便于下次计算
  lastTime = nowTime
  lastSize = event.loaded

  // 计算速度
  let speed = intervalSize / intervalTime
  // 保存以b/s为单位的速度值，方便计算剩余时间
  const bSpeed = speed
  // 单位名称
  let units = 'b/s'
  if (speed / 1024 > 1) {
    speed = speed / 1024
    units = 'k/s'
  }
  if (speed / 1024 > 1) {
    speed = speed / 1024
    units = 'M/s'
  }
  if (speed > 0) {
    // 如果速度大于0
    uploadSpeed.value = speed.toFixed(1) + units
  } else {
    // 如果速度小于等于0 则赋值为0.0
    uploadSpeed.value = (0.0).toString() + units
  }
  // 计算剩余时间
  if (size) {
    // 计算切片上传剩余时间
    const leftTime = size / bSpeed
    uploadTime.value = handleTime(Number(leftTime.toFixed(1)))
  } else {
    // 计算完整上传剩余时间
    const leftTime = ((event.total - event.loaded) / bSpeed)
    uploadTime.value = handleTime(Number(leftTime.toFixed(1)))
  }
}
// const putObjPath = async (payload: { path: { objpath: string, bucket_name: string }, body: { file: File }, index: number, md5: string }) => {
//   console.log(payload)
//   const formData = new FormData()
//   formData.append('file', payload.body.file)
//   return axiosStorage({
//     url: `/api/v2/obj/${payload.path.bucket_name}/${payload.path.objpath}`,
//     method: 'put',
//     headers: {
//       'Content-MD5': payload.md5
//     },
//     data: formData,
//     onUploadProgress: function (progressEvent) {
//       if (progressEvent.lengthComputable) {
//         // 计算进度
//         progressArr.value[payload.index] = (progressEvent.loaded / progressEvent.total * 100).toFixed(1)
//         calcSpeedTime(progressEvent)
//       }
//     }
//   })
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
        // 计算进度
        progressArr.value[payload.index] = (progressEvent.loaded / progressEvent.total * 100).toFixed(1)
        calcSpeedTime(progressEvent)
      }
    }
  })
}
// 切片上传文件
const postObjPath = async (payload: { path: { bucket_name: string, objpath: string }, query: { reset: boolean }, body: { file: File }, index: number }) => {
  const file = payload.body.file
  // 每一片的大小
  const chunkSize = 10 * 1024 * 1024
  // 开始时的位置
  let start = 0
  const fileName = file.name
  const fileSize = file.size
  // 上传第一片文件时需要的参数
  const config = {
    params: payload?.query
  }
  for (let i = 0; i < fileSize; i += chunkSize) {
    let blob = null
    if (start + chunkSize > fileSize) {
      // 文件切片
      blob = file.slice(start, fileSize)
      // 改变偏移量
      start = fileSize
    } else {
      blob = file.slice(start, start + chunkSize)
      start += chunkSize
    }
    const blobFile = new File([blob], fileName)
    const formData = new FormData()
    formData.append('chunk', blobFile)
    // 偏移量需要减去上一次的文件大小 否则会切片错误
    formData.append('chunk_offset ', (start - blobFile.size).toString())
    formData.append('chunk_size', (blobFile.size).toString())
    if (i === 0) {
      await axiosStorage({
        url: `/api/v1/obj/${payload.path.bucket_name}/${payload.path.objpath}/`,
        method: 'post',
        data: formData,
        params: config,
        onUploadProgress: function (progressEvent) {
          if (progressEvent.lengthComputable) {
            // 计算进度
            progressArr.value[payload.index] = (start / fileSize * 100).toFixed(1)
            const surplusSize = fileSize - start
            calcSpeedTime(progressEvent, surplusSize)
          }
        }
      })
    } else {
      await axiosStorage({
        url: `/api/v1/obj/${payload.path.bucket_name}/${payload.path.objpath}/`,
        method: 'post',
        data: formData,
        onUploadProgress: function (progressEvent) {
          if (progressEvent.lengthComputable) {
            // 计算进度
            progressArr.value[payload.index] = (start / fileSize * 100).toFixed(1)
            const surplusSize = fileSize - start
            calcSpeedTime(progressEvent, surplusSize)
          }
        }
      })
    }
  }
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
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-uploader
      :factory="factoryFn"
      @added="addFile"
      label="上传文件"
      multiple
      :headers="[{'Content-Type': 'multipart/form-data'}]"
      style="width: 420px"
    >
      <template v-slot:header="scope">
        <div class="row no-wrap items-center q-pa-sm q-gutter-xs">
          <q-btn v-if="scope.queuedFiles.length > 0 && isUploading === false" icon="clear_all"
                 @click="scope.removeQueuedFiles(); clearAll()" round dense flat>
            <q-tooltip>清空文件</q-tooltip>
          </q-btn>
          <q-spinner v-if="scope.queuedFiles.length > 0 && isUploading === true" class="q-uploader__spinner"/>
          <div class="col">
            <div class="q-uploader__title">上传文件</div>
            <div class="q-uploader__subtitle row">
              <div class="col-2">{{ scope.uploadSizeLabel }}</div>
              <div class="col-4" v-show="isUploading">上传速度：{{ uploadSpeed }}</div>
              <div class="col-4" v-show="isUploading">剩余时间：{{ uploadTime }}</div>
            </div>
          </div>
          <q-btn v-if="isUploading === false" type="a" icon="add_box" @click="scope.pickFiles" round dense flat>
            <q-uploader-add-trigger/>
            <q-tooltip>选择文件</q-tooltip>
          </q-btn>
          <!--          <q-btn icon="clear" @click="cancel()" round dense flat >-->
          <!--            <q-tooltip>取消上传</q-tooltip>-->
          <!--          </q-btn>-->
        </div>
      </template>
      <template v-slot:list="scope">
        <q-list separator>
          <q-card v-for="(file, index) in scope.files" :key="file.__key" flat bordered class="my-card bg-grey-2 q-mt-sm">
            <q-card-section class="q-py-xs q-px-md">
              <div class="row items-center no-wrap">
                <div class="col">
                  <div class="text-weight-bold">{{ file.name }}</div>
                  <div>{{ file.__sizeLabel }}</div>
                </div>
                <div class="col-auto">
                  <q-btn v-if="!isUploading" class="gt-xs" size="12px" flat dense round icon="clear"
                         @click="scope.removeFile(file); clearFile(index)">
                    <q-tooltip>删除文件</q-tooltip>
                  </q-btn>
                  <q-spinner v-show="parseInt(progressArr[index]) > 0 && parseInt(progressArr[index]) !== 100" class="q-uploader__spinner"/>
                </div>
              </div>
            </q-card-section>
            <q-card-section v-if="isUploading" class="q-py-none q-px-md">
              <div class="row items-center">
                <div class="col-11">
                  <q-linear-progress :value="progressArr[index] / 100" color="primary" size="md"/>
                </div>
                <div class="col-1 text-center" v-if="parseInt(progressArr[index]) !== 100">
                  {{ progressArr[index] }}%
                </div>
                <q-icon class="col-1 text-center" name="las la-check-circle" color="positive" v-else/>
              </div>
            </q-card-section>
          </q-card>
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
