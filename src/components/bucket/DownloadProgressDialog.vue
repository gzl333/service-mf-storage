<script lang="ts" setup>
import { computed } from 'vue'
import { useStore } from 'stores/store'
import { QBtn, useDialogPluginComponent } from 'quasar'
import { i18n } from 'boot/i18n'
import $bus from 'boot/bus'
// const props = defineProps({

// })

defineEmits([...useDialogPluginComponent.emits])

const store = useStore()
const { tc } = i18n.global
const downloadProgress = computed(() => store.items.progressList)
const {
  dialogRef,
  onDialogHide
  // onDialogOK,
  // onDialogCancel
} = useDialogPluginComponent()
// const onCancelClick = onDialogCancel\
// 计算文件大小函数(保留两位小数), Size为字节大小
const getFileSize = (size: number) => {
  const num = 1024.00 // byte
  if (size < num) {
    return size + 'B'
  } else if (size < Math.pow(num, 2)) {
    // kb
    return (size / num).toFixed(2) + 'K'
  } else if (size < Math.pow(num, 3)) {
    // M
    return (size / Math.pow(num, 2)).toFixed(2) + 'M'
  } else if (size < Math.pow(num, 4)) {
    // G
    return (size / Math.pow(num, 3)).toFixed(2) + 'G'
  } else {
    // T
    return (size / Math.pow(num, 4)).toFixed(2) + 'T'
  }
}
const deleteFile = (na: string) => {
  const index = store.items.progressList.findIndex(item => item.na === na)
  store.items.progressList.splice(index, 1)
}
const cancelDownload = (na: string) => {
  $bus.emit('cancelSingleDown', na)
}
const cancelAllDownload = () => {
  $bus.emit('cancelAllDown', true)
}
const startAll = () => {
  $bus.emit('startAllDown', true)
}
const clearAll = () => {
  store.items.progressList = []
}
const reDownload = (fileName: string, na: string, fileSize: number) => {
  const index = store.items.progressList.findIndex(progressItem => progressItem.na === na)
  if (store.items.downQueue.length < 3) {
    if (store.items.downQueue.findIndex(item => item.na === na) === -1) {
      // 下载队列入列
      store.items.downQueue.push({ fileName, na, state: 'reload' })
    }
  } else {
    if (store.items.waitQueue.findIndex(item => item.na === na) === -1) {
      // 等待队列入列
      store.items.waitQueue.push({ fileName, na })
      store.items.progressList[index] = {
        fileName,
        na,
        progress: 0,
        loadedSize: 0,
        totalSize: fileSize,
        downSpeed: '等待开始下载',
        surplusTime: '等待开始下载',
        state: 'wait'
      }
    }
  }
}
</script>

<template>
  <!-- notice dialogRef here -->
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin dialog-primary q-pb-md">
      <q-card-section class="row items-center justify-center q-pb-md">
        <div class="text-primary">
          {{ tc('文件下载进度') }}
        </div>
        <q-space/>
        <q-btn icon="close" flat dense size="sm" v-close-popup/>
      </q-card-section>
      <q-separator/>
      <div class="row justify-end q-mt-xs">
        <q-btn :disabled="!(downloadProgress.length > 0 && downloadProgress.findIndex(progress => progress.state === 'cancel') !== -1 && downloadProgress.findIndex(progress => progress.state === 'download') === -1)" no-caps color="primary" label="全部开始" class="q-mr-xs" @click="startAll"/>
        <q-btn :disabled="!(downloadProgress.length > 0 && downloadProgress.findIndex(progress => progress.state === 'download') !== -1)" no-caps color="primary" label="全部取消" class="q-mr-xs" @click="cancelAllDownload" />
        <q-btn no-caps color="primary" label="全部删除"
               :disabled="store.items.downQueue.length + store.items.waitQueue.length !== 0 || store.items.progressList.length === 0"
               @click="clearAll"/>
      </div>
      <q-list separator>
        <div v-if="downloadProgress.length > 0">
          <q-card v-for="(file, index) in downloadProgress" :key="index" flat bordered
                  class="my-card bg-grey-2 q-mt-sm">
            <q-card-section class="q-py-xs q-px-md">
              <div class="text-weight-bold">{{ file.fileName }}</div>
              <div class="row items-center">
                <div class="col-9" v-if="file.state !== 'cancel'">
                  <q-linear-progress :value="file.progress / 100" color="positive" size="md"/>
                </div>
                <div v-else>已取消下载</div>
                <div class="text-center q-ml-sm" v-if="file.state === 'download' || file.state === 'wait'">{{ file.progress }}%</div>
                <q-btn v-if="file.state === 'download'" class="q-ml-sm" size="md" flat dense round
                       icon="clear" @click="cancelDownload(file.na)">
                  <q-tooltip>{{ tc('取消下载') }}</q-tooltip>
                </q-btn>
                <q-btn v-if="file.state === 'cancel'" class="q-ml-sm" size="md" flat dense round
                       icon="las la-arrow-alt-circle-down" @click="reDownload(file.fileName, file.na ,file.totalSize)">
                  <q-tooltip>{{ tc('重新下载') }}</q-tooltip>
                </q-btn>
                <q-icon v-if="file.state === 'complete'" name="las la-check-circle" size="sm" color="positive"
                        class="q-ml-sm"/>
                <q-btn v-if="file.state === 'complete' || file.state === 'cancel'" size="md" flat dense round icon="las la-trash-alt" @click="deleteFile(file.na)">
                  <q-tooltip>{{ tc('删除') }}</q-tooltip>
                </q-btn>
              </div>
              <div class="row">
                <div>{{ getFileSize(file.loadedSize) + '/' + getFileSize(file.totalSize) }}</div>
                <div class="q-ml-sm" v-if="file.state !== 'cancel'">下载速度：{{ file.downSpeed }}</div>
                <div class="q-ml-sm" v-if="file.state !== 'cancel'">
                  <span>剩余时间：</span>
                  <span v-if="file.progress !== 100">{{ file.surplusTime }}</span>
                  <span v-else>下载完成</span>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
        <div v-else class="text-center text-subtitle1 q-mt-lg">
          暂无下载文件
        </div>
      </q-list>
    </q-card>
  </q-dialog>
</template>

<style lang="scss" scoped>
</style>
