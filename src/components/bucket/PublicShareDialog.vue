<script lang="ts" setup>
import { ref, Ref } from 'vue'
import { useStore } from 'stores/store'
import { Notify, useDialogPluginComponent } from 'quasar'
// import { useRoute } from 'vue-router'
import { i18n } from 'boot/i18n'
import api from 'src/api/index'
import $bus from 'src/hooks/bus'
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
  pathObj: {
    type: Object,
    required: true
  },
  isOperationStore: {
    type: Boolean,
    required: false
  }
})

const store = useStore()
// const $route = useRoute()
const { tc } = i18n.global
defineEmits([...useDialogPluginComponent.emits])
const {
  dialogRef,
  onDialogHide,
  onDialogOK,
  onDialogCancel
} = useDialogPluginComponent()
const onCancelClick = onDialogCancel
// const bucket = $route.query.bucket as string // string or undefined
// const path = $route.query.path as string
const selectModel = ref(null)
const isPass = ref(false)
const options = [
  {
    label: tc('私有'),
    value: -1,
    share: 0
  },
  {
    label: tc('1天'),
    value: 1,
    share: 1
  },
  {
    label: tc('7天'),
    value: 7,
    share: 1
  },
  {
    label: tc('30天'),
    value: 30,
    share: 1
  },
  {
    label: tc('永久公开'),
    value: 0,
    share: 1
  }
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
  if (selectModel.value !== null) {
    const base = store.tables.serviceTable.byId[store.tables.bucketTable.byId[props.bucketId]?.service.id]?.endpoint_url
    // 批量分享分享文件夹
    if (props.pathObj.dirArrs && props.pathObj.dirArrs.length > 0) {
      // 判断是否选择带有密码
      if (isPass.value === false) {
        for (const item of props.pathObj.dirArrs) {
          void await api.storage.single.patchDirPath({
            base,
            path: {
              bucket_name: props.bucket_name,
              dirpath: item.na
            },
            query: {
              share: shareQuery.value.share,
              days: shareQuery.value.days
            }
          })
        }
      } else {
        for (const item of props.pathObj.dirArrs) {
          void await api.storage.single.patchDirPath({
            base,
            path: {
              bucket_name: props.bucket_name,
              dirpath: item.na
            },
            query: {
              share: shareQuery.value.share,
              days: shareQuery.value.days,
              password: ''
            }
          })
        }
      }
    }
    // 批量分享分享文件
    if (props.pathObj.fileArrs && props.pathObj.fileArrs.length > 0) {
      if (isPass.value === false) {
        for (const item of props.pathObj.fileArrs) {
          void await api.storage.single.patchObjPath({
            base,
            path: {
              bucket_name: props.bucket_name,
              objpath: item.na
            },
            query: {
              share: shareQuery.value.share,
              days: shareQuery.value.days
            }
          })
        }
      } else {
        for (const item of props.pathObj.fileArrs) {
          void await api.storage.single.patchObjPath({
            base,
            path: {
              bucket_name: props.bucket_name,
              objpath: item.na
            },
            query: {
              share: shareQuery.value.share,
              days: shareQuery.value.days,
              password: ''
            }
          })
        }
      }
    }
    if (props.isOperationStore) {
      void store.changeShareStatus({
        bucket_name: props.localId,
        dirpath: {
          dirArrs: props.pathObj.dirArrs,
          fileArrs: props.pathObj.fileArrs
        },
        share: shareQuery.value.share
      })
    } else {
      // 综合检索页面 如果修改权限为私有直接刷新数据
      if (shareQuery.value.share === 0 || props.pathObj.fileArrs.length > 1) {
        $bus.emit('refresh', true)
      }
    }
    onDialogOK()
    // 如果是分享的单个文件夹或文件并且不是修改为私有 分享成功后打开已经分享的窗口
    if (props.pathObj.dirArrs && !props.pathObj.fileArrs && props.pathObj.dirArrs.length === 1 && shareQuery.value.share !== 0) {
      void store.triggerAlreadyShareDialog(props.bucketId, props.localId, props.bucket_name, { dirArrs: props.pathObj.dirArrs }, props.isOperationStore, false)
    } else if (!props.pathObj.dirArrs && props.pathObj.fileArrs && props.pathObj.fileArrs.length === 1 && shareQuery.value.share !== 0) {
      void store.triggerAlreadyShareDialog(props.bucketId, props.localId, props.bucket_name, { fileArrs: props.pathObj.fileArrs }, props.isOperationStore, true)
    }
  } else {
    Notify.create({
      classes: 'notification-negative shadow-15',
      icon: 'check_circle',
      textColor: 'negative',
      message: `${tc('请选择分享权限')}`,
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
          {{ tc('公开分享') }}
        </div>
        <q-space/>
        <q-btn icon="close" flat dense size="sm" v-close-popup/>
      </q-card-section>
      <q-separator/>
      <q-card-section>
        <div class="row justify-center">
          <q-select class="col-6" clearable outlined v-model="selectModel" :options="options"
                    @update:model-value="selectFun" :label="tc('请选择')"/>
        </div>
        <div class="row justify-center q-mt-md">
          <q-checkbox v-model="isPass" @update:model-value="isHavePass" :label="tc('有分享密码保护')"/>
        </div>
        <div class="row justify-center q-mt-lg">
          <q-btn class="q-ma-sm" color="primary" :label="tc('分享')" unelevated no-caps @click="share"/>
          <q-btn class="q-ma-sm" color="primary" :label="tc('取消')" unelevated no-caps @click="onCancelClick"/>
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
</style>
