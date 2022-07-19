<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { useDialogPluginComponent } from 'quasar'
// import useCopyToClipboard from 'src/hooks/useCopyToClipboard'
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
  onDialogHide,
  onDialogCancel
} = useDialogPluginComponent()
// const clickToCopy = useCopyToClipboard()
const onCancelClick = onDialogCancel
const shareUrl = ref('')
const shareCode = ref('')
const share = async () => {
  if (props.pathObj.dirArrs && props.pathObj.dirArrs.length > 0) {
    await store.triggerPublicShareDialog({ localId: props.bucket_name, dirNames: { dirArrs: props.pathObj.dirArrs } })
  }
  if (props.pathObj.fileArrs && props.pathObj.fileArrs.length > 0) {
    await store.triggerPublicShareDialog({ localId: props.bucket_name, dirNames: { fileArrs: props.pathObj.fileArrs } })
  }
  onCancelClick()
}
onMounted(async () => {
  let dirName = ''
  if (props.pathObj.dirArrs) {
    dirName = props.pathObj.dirArrs[0]
  } else {
    dirName = props.pathObj.fileArrs[0]
  }
  const respShareDir = await storage.storage.api.getPath({ path: { bucket_name: props.bucket_name, path: dirName } })
  shareUrl.value = respShareDir.data.share_uri
  shareCode.value = respShareDir.data.share_code
})
</script>

<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin dialog-primary">
      <q-separator/>
      <q-card-section>
        <div class="text-h6 text-center">{{tc('当前对象已经是共享状态')}}</div>
        <div class="myUrl text-subtitle1 q-mt-lg text-center">
          <span>{{tc('分享链接')}}：</span>
          <span>
            {{ shareUrl }}
<!--            <q-tooltip anchor="top middle">-->
<!--              {{ tc('点击复制链接') }}-->
<!--            </q-tooltip>-->
          </span>
          </div>
        <div v-if="shareCode !== undefined" class="text-subtitle1 text-center q-mt-lg">{{tc('分享密码')}}：{{ shareCode }}</div>
        <div class="row justify-center q-mt-lg">
          <q-btn class="q-ma-sm" color="primary" :label="tc('修改共享状态')" unelevated @click="share"/>
          <q-btn class="q-ma-sm" color="primary" :label="tc('取消')" unelevated @click="onCancelClick"/>
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
.myUrl {
  word-wrap: break-word;
  word-break: break-all;
  overflow: hidden;
}
</style>
