<script lang="ts" setup>
import { onBeforeMount, ref } from 'vue'
import { useDialogPluginComponent } from 'quasar'
import useCopyToClipboard from 'src/hooks/useCopyToClipboard'
import { useStore } from 'stores/store'
import storage from 'src/api/index'
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
    await store.triggerPublicShareDialog({
      localId: props.bucket_name,
      dirNames: { dirArrs: props.pathObj.dirArrs }
    })
  }
  if (props.pathObj.fileArrs && props.pathObj.fileArrs.length > 0) {
    await store.triggerPublicShareDialog({
      localId: props.bucket_name,
      dirNames: { fileArrs: props.pathObj.fileArrs }
    })
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
onBeforeMount(async () => {
  let dirName = ''
  if (props.pathObj.dirArrs) {
    dirName = props.pathObj.dirArrs[0]
  } else {
    dirName = props.pathObj.fileArrs[0]
  }
  const respShareDir = await storage.storage.api.getPath({
    path: {
      bucket_name: props.bucket_name,
      path: dirName
    }
  })
  shareCode.value = respShareDir.data.share_code || ''
  if (respShareDir.data.is_obj === false) {
    shareUrl.value = window.location.protocol + '//' + window.location.hostname + '/storage/share/?base=' + props.bucket_name + '/' + props.pathObj.dirArrs[0]
  } else {
    // shareUrl.value = 'https://' + domainName + '/storage/share/down/obs/' + props.bucket_name + '/' + props.pathObj.fileArrs[0]
    shareUrl.value = respShareDir.data.share_uri
  }
})
</script>

<template>
  <q-dialog ref="dialogRef">
    <q-card class="q-dialog-plugin dialog-primary">
      <q-separator/>
      <div class="row justify-end">
        <q-btn icon="close" flat dense size="md" v-close-popup/>
      </div>
      <q-card-section>
        <div class="text-h6 text-center">{{ tc('当前对象已经是共享状态') }}</div>
        <div class="text-subtitle1 q-mt-lg text-center" style="word-wrap: break-word; word-break: break-all; overflow: hidden;">
          <span>{{ tc('分享链接') }}：{{ shareUrl }}</span>
        </div>
        <div v-if="shareCode !== ''" class="text-subtitle1 text-center q-mt-lg">{{ tc('分享密码') }}：{{ shareCode }}
        </div>
        <div class="row justify-center q-mt-lg">
          <q-btn class="q-ma-sm" color="primary" :label="tc('复制分享链接')" no-caps unelevated @click="copyUrl(shareUrl)"/>
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
