<script lang="ts" setup>
import { computed } from 'vue'
import { useStore } from 'stores/store'
import { QBtn, useDialogPluginComponent } from 'quasar'
import { i18n } from 'boot/i18n'
// import api from 'src/api/index'

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
// const onCancelClick = onDialogCancel
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
</script>

<template>
  <!-- notice dialogRef here -->
  <q-dialog ref="dialogRef" @hide="onDialogHide" position="right">
    <q-card class="q-dialog-plugin dialog-primary q-pb-md">
      <q-card-section class="row items-center justify-center q-pb-md">
        <div class="text-primary">
          {{ tc('文件下载进度') }}
        </div>
        <q-space/>
        <q-btn icon="close" flat dense size="sm" v-close-popup/>
      </q-card-section>
      <q-separator/>
      <q-list separator>
        <div v-if="downloadProgress.length > 0">
          <q-card v-for="(file, index) in downloadProgress" :key="index" flat bordered
                  class="my-card bg-grey-2 q-mt-md">
            <q-card-section class="q-py-xs q-px-md">
              <div class="row no-wrap items-center justify-between">
                <div class="col-4">
                  <div class="text-weight-bold">{{ file.fileName }}</div>
                  <div>{{ getFileSize(file.loaded) + '/' + getFileSize(file.totalSize) }}</div>
                </div>
                <div class="col-8 row">
                  <div class="col-12 row items-center justify-between">
                    <div class="col-10">
                      <q-linear-progress :value="file.progress / 100" color="positive" size="md"/>
                    </div>
                    <div class="text-center">{{ file.progress }}%</div>
                  </div>
                  <div>
                    <span>下载速度：{{ file.speed }}</span>
                    <span class="q-ml-sm">剩余时间：</span>
                    <span v-show="file.progress !== 100">{{ file.time }}</span>
                    <span v-show="file.progress === 100">下载完成</span>
                  </div>
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
