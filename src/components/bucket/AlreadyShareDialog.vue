<script lang="ts" setup>
import { onBeforeMount, ref } from 'vue'
import { useDialogPluginComponent } from 'quasar'
import useCopyToClipboard from 'src/hooks/useCopyToClipboard'
import { useStore } from 'stores/store'
import { i18n } from 'boot/i18n'
import api from 'src/api/index'
import emitter from 'boot/mitt'

const props = defineProps({
  bucketId: {
    type: String,
    required: true
  },
  localId: {
    type: String,
    required: true
  },
  bucketName: {
    type: String,
    required: true
  },
  pathObj: {
    type: Object,
    required: true
  },
  isOperationStore: {
    type: Boolean,
    required: true
  },
  isRefresh: {
    type: Boolean
  }
})
const store = useStore()
const { tc } = i18n.global
// defineEmits([...useDialogPluginComponent.emits])
const {
  dialogRef,
  onDialogCancel
} = useDialogPluginComponent()
const clickToCopy = useCopyToClipboard()
const onCancelClick = onDialogCancel
const shareUrl = ref('')
const shareCode = ref('')
const share = async () => {
  if (props.pathObj.dirArrs && props.pathObj.dirArrs.length > 0) {
    await store.triggerPublicShareDialog(props.bucketId, props.localId, props.bucketName, { dirArrs: props.pathObj.dirArrs }, props.isOperationStore)
  }
  if (props.pathObj.fileArrs && props.pathObj.fileArrs.length > 0) {
    await store.triggerPublicShareDialog(props.bucketId, props.localId, props.bucketName, { fileArrs: props.pathObj.fileArrs }, props.isOperationStore)
  }
  onCancelClick()
}
const copyUrl = (url: string) => {
  if (shareCode.value === '') {
    clickToCopy(url)
  } else {
    clickToCopy(url + '&p=' + shareCode.value)
  }
}
const onDialogHide = () => {
  // 窗口关闭时判断是否刷新数据，还是需要操作store
  if (!props.isOperationStore && props.isRefresh) {
    // 在综合检索页面窗口关闭需要重新请求
    emitter.emit('refresh', true)
  }
}
onBeforeMount(async () => {
  let dirName = ''
  // 判断是文件夹还是文件
  if (props.pathObj.dirArrs) {
    dirName = props.pathObj.dirArrs[0].na
  } else if (props.pathObj.fileArrs) {
    dirName = props.pathObj.fileArrs[0].na
  }
  const base = store.tables.serviceTable.byId[store.tables.bucketTable.byId[props.bucketId]?.service.id]?.endpoint_url
  const serviceId = store.tables.bucketTable.byId[props.bucketId]?.service.id
  const respShareDir = await api.storage.single.getPath({
    base,
    path: {
      bucket_name: props.bucketName,
      path: dirName
    }
  })
  shareCode.value = respShareDir.data.share_code || ''
  // 根据后端返回值判断拼接分享链接还是直接使用后端返回的链接
  if (respShareDir.data.is_obj === false) {
    // http://servicedev.cstcloud.cn/storage/share/123?base=xxx&sub=yyy&p=zzz
    shareUrl.value = window.location.protocol + '//' + window.location.hostname + '/storage/share/' + serviceId + '?base=' + props.bucketName + '/' + props.pathObj.dirArrs[0].na
  } else {
    // shareUrl.value = 'https://' + domainName + '/storage/share/down/obs/' + props.bucket_name + '/' + props.pathObj.fileArrs[0]
    shareUrl.value = respShareDir.data.share_uri
  }
})
</script>

<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin dialog-primary">
      <q-separator/>
      <div class="row justify-end">
        <q-btn icon="close" flat dense size="md" v-close-popup/>
      </div>
      <q-card-section>
        <div class="text-h6 text-center">{{ tc('当前对象已经是共享状态') }}</div>
        <div class="text-subtitle1 q-mt-lg text-center"
             style="word-wrap: break-word; word-break: break-all; overflow: hidden;">
          <span>{{ tc('分享链接') }}：{{ shareUrl }}</span>
        </div>
        <div v-if="shareCode !== ''" class="text-subtitle1 text-center q-mt-lg">{{ tc('分享密码') }}：{{ shareCode }}
        </div>
        <div class="row justify-center q-mt-lg">
          <q-btn class="q-ma-sm" color="primary" :label="tc('复制分享链接')" no-caps unelevated
                 @click="copyUrl(shareUrl)"/>
          <q-btn class="q-ma-sm" color="primary" :label="tc('修改共享状态')" no-caps unelevated @click="share"/>
        </div>
      </q-card-section>
      <q-separator/>
      <div class="text-center q-pa-md">
        {{ tc('提示：创建新的带密码的分享，旧的分享密码会失效') }}
      </div>
    </q-card>
  </q-dialog>
</template>

<style lang="scss" scoped>
.my-url {
  word-wrap: break-word;
  word-break: break-all;
  overflow: hidden;
}
</style>
