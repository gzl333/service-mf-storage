<script lang="ts" setup>
import { computed, Ref, ref } from 'vue'
import { useStore } from 'stores/store'
import { useRoute } from 'vue-router'
import { Notify, useDialogPluginComponent } from 'quasar'
import { axiosStorage } from 'boot/axios'
import axios from 'axios'
import api from 'src/api/index'
import { FloatSub } from 'src/hooks/handleFloat'
import { i18n } from 'boot/i18n'
// import SparkMD5 from 'spark-md5'

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
  dirPath: {
    type: String,
    required: true
  }
})
const currentBucket = computed(() => store.tables.bucketTable.byId[props.bucketId])
const route = useRoute()
const store = useStore()
const { tc } = i18n.global
// CancelToken和source用于正在上传关闭窗口 取消正在发送的请求
const CancelToken = axios.CancelToken
const source = CancelToken.source()
const fileArr: Ref = ref([])
// 上传进度 数组形式 多个上传 每个值代表一个文件的上传进度
const progressArr: Ref<Array<string | number>> = ref([])
// 上传速度
const uploadSpeed = ref()
// 上传剩余时间
const uploadTime = ref()
// 用于判断是否正在上传
const isUploading = ref(false)
// 用于判断用户是否关闭窗口
const isClose = ref(false)
// 用于判断是否取消正在上传的请求
const isCancel = ref(false)
// 用于鼠标事件
const isHover = ref(false)
const base = store.tables.serviceTable.byId[store.tables.bucketTable.byId[props.bucketId]?.service.id]?.endpoint_url
const {
  dialogRef,
  onDialogHide,
  onDialogOK,
  onDialogCancel
} = useDialogPluginComponent()
defineEmits([...useDialogPluginComponent.emits])
// 上一次计算时间
let lastTime = 0
// 上一次计算的文件大小
let lastSize = 0
// 关闭窗口
const close = async () => {
  isClose.value = true
  onDialogCancel()
}
// 删除列表中的文件
const clearFile = (index: string) => {
  fileArr.value.splice(index, 1)
}
// 删除所有文件
const clearAll = () => {
  fileArr.value = []
}
const onMouseEnter = () => {
  isHover.value = true
}
const onMouseLeave = () => {
  isHover.value = false
}
// 取消正在上传的请求
const cancelUpload = () => {
  source.cancel('取消请求')
  Notify.create({
    classes: 'notification-negative shadow-15',
    icon: 'las la-times-circle',
    textColor: 'negative',
    message: tc('已取消上传'),
    position: 'bottom',
    closeBtn: true,
    timeout: 5000,
    multiLine: false
  })
  // source = axios.CancelToken.source()
}
// 添加文件
const addFile = (files: string | File[]) => {
  // 正在上传中不可添加文件
  if (isUploading.value === false) {
    for (const file of files) {
      // 最多支持添加十个文件
      if (fileArr.value.length < 10) {
        fileArr.value.push(file)
      } else {
        Notify.create({
          classes: 'notification-negative shadow-15',
          icon: 'las la-times-circle',
          textColor: 'negative',
          message: tc('已到达最大选择数量'),
          position: 'bottom',
          closeBtn: true,
          timeout: 5000,
          multiLine: false
        })
        break
      }
    }
  } else {
    Notify.create({
      classes: 'notification-negative shadow-15',
      icon: 'las la-times-circle',
      textColor: 'negative',
      message: tc('上传中不可添加文件'),
      position: 'bottom',
      closeBtn: true,
      timeout: 5000,
      multiLine: false
    })
  }
}
// 计算MD5
// const getMD5 = async (file: File, index?: number) => {
// // 使用sparkMD5的ArrayBuffer类，读取二进制文件
//   const spark = new SparkMD5.ArrayBuffer()
//   const fileReader = new FileReader()
//   fileReader.readAsBinaryString(file)
//   // 异步操作，读完后的结果
//   fileReader.onload = async (e: any) => {
//     // 把文件开始传入spark
//     await spark.append(e.target.result)
//     // spark计算出MD5后的结果
//     const md5 = spark.end()
//     // await console.log(md5)
//     // await console.log(e.target.result)
//     await putObjPath1({ path: { objpath: file.name, bucket_name: props.bucket_name }, body: e.target.result, md5 })
//   }
//   // fileReader读取二进制文件
//   // await fileReader.readAsArrayBuffer(file)
// }
const handleTime = (time: number) => {
  // 文件切片上传 每一片开始的时候 会有一刻速度为0
  if (time > 0) {
    // 超过一小时
    if (time / 60 / 60 > 1) {
      const intHour = parseInt((time / 60 / 60).toString())
      const floatHour = parseFloat((time / 60 / 60).toFixed(1))
      const num = FloatSub(floatHour, intHour)
      const min = num * 60
      if (intHour < 24) {
        return intHour + tc('小时') + min + tc('分钟')
      } else {
        return tc('超过一天')
      }
      //  超过一分钟
    } else if (time / 60 > 1) {
      const intMin = parseInt((time / 60).toString())
      const floatMin = parseFloat((time / 60).toFixed(1))
      const num = FloatSub(floatMin, intMin)
      const sec = num * 60
      return intMin + tc('分钟') + sec + tc('秒')
    } else {
      const sec = parseInt(time.toString())
      if (sec > 0) {
        return sec + tc('秒')
      } else {
        return 0 + tc('秒')
      }
    }
  } else {
    return tc('计算中')
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
// const putObjPath1 = async (payload: { path: { objpath: string, bucket_name: string }, body: File | string, index?: number, md5: string }) => {
//   console.log(payload)
//   // const formData = new FormData()
//   // formData.append('file', payload.body.file)
//   return axiosStorage({
//     url: `/api/v2/obj/${payload.path.bucket_name}/${payload.path.objpath}`,
//     method: 'put',
//     headers: {
//       'Content-MD5': payload.md5
//     },
//     data: payload.body,
//     onUploadProgress: function (progressEvent) {
//       if (progressEvent.lengthComputable) {
//         // 计算进度
//         // progressArr.value[payload.index] = (progressEvent.loaded / progressEvent.total * 100).toFixed(1)
//         // calcSpeedTime(progressEvent)
//       }
//     }
//   })
// }
// 上传完整文件不切片
const putObjPath = async (payload: { path: { bucket_name: string, objpath: string }, body: { file: File }, index: number }) => {
  const formData = new FormData()
  formData.append('file', payload.body.file)
  return axiosStorage({
    url: base + `/api/v1/obj/${payload.path.bucket_name}/${payload.path.objpath}/`, // todo 改成服务单元对应api
    method: 'put',
    cancelToken: source.token,
    data: formData,
    onUploadProgress: async function (progressEvent) {
      if (progressEvent.lengthComputable) {
        // 计算进度
        progressArr.value[payload.index] = (progressEvent.loaded / progressEvent.total * 100).toFixed(1)
        // 计算速度和时间
        calcSpeedTime(progressEvent)
        if (isClose.value) {
          // 取消正在发的请求
          cancelUpload()
          void await store.addPathTable(
            currentBucket.value.id,
            route.query.path as string
          )
        }
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
  // 从第一片开始循环上传
  for (let i = 0; i < fileSize; i += chunkSize) {
    // 如果上传中途关闭窗口 取消上传
    if (isClose.value === false) {
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
        // 第一片上传需要提交reset参数
        await axiosStorage({
          url: base + `/api/v1/obj/${payload.path.bucket_name}/${payload.path.objpath}/`,
          method: 'post',
          data: formData,
          params: config,
          onUploadProgress: function (progressEvent) {
            if (progressEvent.lengthComputable) {
              // 计算进度
              progressArr.value[payload.index] = (start / fileSize * 100).toFixed(1)
              const surplusSize = fileSize - start
              // 计算速度和时间
              calcSpeedTime(progressEvent, surplusSize)
            }
          }
        })
      } else {
        await axiosStorage({
          url: base + `/api/v1/obj/${payload.path.bucket_name}/${payload.path.objpath}/`,
          method: 'post',
          data: formData,
          onUploadProgress: function (progressEvent) {
            if (progressEvent.lengthComputable) {
              // 计算进度
              progressArr.value[payload.index] = (start / fileSize * 100).toFixed(1)
              const surplusSize = fileSize - start
              // 计算速度和时间
              calcSpeedTime(progressEvent, surplusSize)
            }
          }
        })
      }
    } else {
      break
    }
  }
  // 取消需要删除碎片文件
  let objpath
  if (props.dirPath === '') {
    objpath = fileName
  } else {
    objpath = props.dirPath + '/' + fileName
  }
  // 如果已经上传的文件大小小于文件原本大小 代表未上传完全需要删除碎片
  if (start < fileSize) {
    isCancel.value = true
    await api.storage.single.deleteObjPath({
      base,
      path: {
        bucket_name: props.bucket_name,
        objpath
      }
    })
    void await store.addPathTable(
      currentBucket.value.id,
      route.query.path as string
    )
    fileArr.value = []
    isUploading.value = false
  }
}

const factoryFn = async (files: File, index: number) => {
  // await getMD5(files, index)
  let objpath
  if (props.dirPath === '') {
    objpath = files.name
  } else {
    objpath = props.dirPath + '/' + files.name
  }
  // 文件大于500MB 切片上传
  if (files.size / 1024 / 1024 > 500) {
    await postObjPath({
      path: {
        bucket_name: props.bucket_name,
        objpath
      },
      query: { reset: true },
      body: { file: files },
      index
    })
  } else {
    // 完整上传
    await putObjPath({
      path: {
        bucket_name: props.bucket_name,
        objpath
      },
      body: { file: files },
      index
    })
  }
}
const upload = async () => {
  isCancel.value = false
  if (fileArr.value.length !== 0) {
    // 循环建立进度条 每一个值代表一个进度条
    for (let index = 0; index < fileArr.value.length; index++) {
      progressArr.value[index] = 0
    }
    isUploading.value = true
    for (let index = 0; index < fileArr.value.length; index++) {
      // 开始上传
      void await factoryFn(fileArr.value[index], index)
    }
    if (isCancel.value === false) {
      Notify.create({
        classes: 'notification-positive shadow-15',
        icon: 'check_circle',
        textColor: 'positive',
        message: tc('上传成功'),
        position: 'bottom',
        closeBtn: true,
        timeout: 5000,
        multiLine: false
      })
    } else {
      Notify.create({
        classes: 'notification-negative shadow-15',
        icon: 'las la-times-circle',
        textColor: 'negative',
        message: tc('已取消上传'),
        position: 'bottom',
        closeBtn: true,
        timeout: 5000,
        multiLine: false
      })
    }
    onDialogOK()
    // 当前path对象
    void await store.addPathTable(
      currentBucket.value.id,
      route.query.path as string
    )
    fileArr.value = []
    isUploading.value = false
  } else {
    Notify.create({
      classes: 'notification-negative shadow-15',
      icon: 'las la-times-circle',
      textColor: 'negative',
      message: `${tc('请选择文件')}`,
      position: 'bottom',
      closeBtn: true,
      timeout: 5000,
      multiLine: false
    })
  }
}
const noAdd = () => {
  Notify.create({
    classes: 'notification-negative shadow-15',
    icon: 'las la-times-circle',
    textColor: 'negative',
    message: tc('上传中不可添加文件'),
    position: 'bottom',
    closeBtn: true,
    timeout: 5000,
    multiLine: false
  })
}
</script>

<template>
  <q-dialog ref="dialogRef" persistent @hide="onDialogHide">
    <q-uploader
      :factory="factoryFn"
      @added="addFile"
      :label="tc('上传文件')"
      multiple
      :headers="[{'Content-Type': 'multipart/form-data'}]"
      style="width: 600px"
    >
      <template v-slot:header="scope">
        <div class="row no-wrap items-center q-pa-sm q-gutter-xs">
          <q-btn v-if="scope.queuedFiles.length > 0 && isUploading === false" icon="clear_all"
                 @click="scope.removeQueuedFiles(); clearAll()" round dense flat>
            <q-tooltip>{{ tc('清空文件') }}</q-tooltip>
          </q-btn>
          <div class="col">
            <div class="q-uploader__title">{{ tc('上传文件') }}</div>
            <div class="q-uploader__subtitle row">
              <div class="col-4">{{ tc('文件总大小') }}：{{ scope.uploadSizeLabel }}</div>
              <div class="col-4" v-show="isUploading">{{ tc('上传速度') }}：{{ uploadSpeed }}</div>
              <div class="col-4" v-show="isUploading">{{ tc('剩余时间') }}：{{ uploadTime }}</div>
            </div>
          </div>
          <div v-if="isUploading === false" class="invisible">
            <q-btn type="a" icon="add_box" @click="scope.pickFiles" round dense flat>
              <q-uploader-add-trigger/>
            </q-btn>
          </div>
          <!--          <q-btn icon="clear" @click="close()" round dense flat>-->
          <!--            <q-tooltip>取消上传</q-tooltip>-->
          <!--          </q-btn>-->
        </div>
      </template>
      <template v-slot:list="scope">
        <q-card flat class="q-py-md cursor-pointer"
                :style="isHover ? 'border: #1976D2 1px dashed': 'border: darkgrey 1px dashed'"
                @mouseenter="onMouseEnter" @mouseleave="onMouseLeave"
                @click="isUploading ? noAdd() : scope.pickFiles()">
          <div class="text-center">
            <q-icon name="las la-cloud-upload-alt" size="4em"/>
            <div class="q-mt-xs">{{ tc('拖拽文件或者点击选择文件') }}</div>
          </div>
        </q-card>
        <q-list separator>
          <q-card v-for="(file, index) in fileArr" :key="file.__key" flat bordered class="my-card bg-grey-2 q-mt-sm">
            <q-card-section class="q-py-xs q-px-md">
              <div class="row items-center no-wrap">
                <div class="col">
                  <div class="text-weight-bold">{{ file.name }}</div>
                  <div>{{ file.__sizeLabel }}</div>
                </div>
                <div class="col-auto">
                  <q-btn v-if="!isUploading" class="gt-xs" size="12px" flat dense round icon="clear"
                         @click="scope.removeFile(file); clearFile(index)">
                    <q-tooltip>{{ tc('删除文件') }}</q-tooltip>
                  </q-btn>
                  <q-spinner v-show="parseInt(progressArr[index]) > 0 && parseInt(progressArr[index]) !== 100"
                             class="q-uploader__spinner"/>
                  <q-icon v-show="parseInt(progressArr[index]) === 100" name="las la-check-circle" color="positive"
                          size="lg"/>
                </div>
              </div>
            </q-card-section>
            <q-card-section v-if="isUploading" class="q-py-none q-px-md">
              <div class="row items-center">
                <div class="col-11">
                  <q-linear-progress :value="progressArr[index] / 100" color="positive" size="md"/>
                </div>
                <div class="col-1 text-center">{{ progressArr[index] }}%</div>
              </div>
            </q-card-section>
          </q-card>
        </q-list>
        <div class="row justify-between q-mt-sm">
          <q-btn class="q-ml-xs" color="primary" :label="tc('上传')" unelevated no-caps @click="upload"
                 :disable="isUploading"/>
          <q-btn class="q-mr-xs" color="primary" :label="tc('取消')" unelevated no-caps @click="close"/>
        </div>
      </template>
    </q-uploader>
  </q-dialog>
</template>

<style lang="scss" scoped>
.borderLeave {
  border: darkgrey 1px dashed;
}

.borderEnter {
  border: $primary 1px dashed;
}
</style>
