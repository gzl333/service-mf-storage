<script lang="ts" setup>
import { ref, Ref } from 'vue'
import { useStore } from 'stores/store'
import { Notify, useDialogPluginComponent } from 'quasar'
import storage from 'src/api/index'
// import { useRoute } from 'vue-router'
import { i18n } from 'boot/i18n'
import emitter from 'boot/mitt'

const props = defineProps({
  domain: {
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
  isSearch: {
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
// const bucket = $route.query.bucket as string // string or undefined
// const path = $route.query.path as string
const onCancelClick = onDialogCancel
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
    if (props.pathObj.dirArrs && props.pathObj.dirArrs.length > 0) {
      if (isPass.value === false) {
        for (const item of props.pathObj.dirArrs) {
          void await storage.storage.api.patchDirPath({
            path: {
              bucket_name: props.bucket_name,
              dirpath: item
            },
            query: {
              share: shareQuery.value.share,
              days: shareQuery.value.days
            }
          })
        }
      } else {
        for (const item of props.pathObj.dirArrs) {
          void await storage.storage.api.patchDirPath({
            path: {
              bucket_name: props.bucket_name,
              dirpath: item
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
    if (props.pathObj.fileArrs && props.pathObj.fileArrs.length > 0) {
      if (isPass.value === false) {
        for (const item of props.pathObj.fileArrs) {
          await store.shareObjItem({ domain: props.domain, path: { bucket_name: props.bucket_name, objPath: item }, query: { share: shareQuery.value.share, days: shareQuery.value.days } })
          // void await storage.storage.api.patchObjPath({
          //   path: {
          //     bucket_name: props.bucket_name,
          //     objpath: item
          //   },
          //   query: {
          //     share: shareQuery.value.share,
          //     days: shareQuery.value.days
          //   }
          // })
        }
      } else {
        for (const item of props.pathObj.fileArrs) {
          await store.shareObjItem({ domain: props.domain, path: { bucket_name: props.bucket_name, objPath: item }, query: { share: shareQuery.value.share, days: shareQuery.value.days, password: '' } })
          // void await storage.storage.api.patchObjPath({
          //   path: {
          //     bucket_name: props.bucket_name,
          //     objpath: item
          //   },
          //   query: {
          //     share: shareQuery.value.share,
          //     days: shareQuery.value.days,
          //     password: ''
          //   }
          // })
        }
      }
    }
    if (!props.isSearch) {
      void store.changeShareStatus({
        item: {
          bucket_name: props.bucket_name,
          dirpath: {
            dirArrs: props.pathObj.dirArrs,
            fileArrs: props.pathObj.fileArrs
          },
          share: shareQuery.value.share
        }
      })
    } else {
      emitter.emit('done', true)
    }
    onDialogOK()
    if (props.pathObj.dirArrs && !props.pathObj.fileArrs && props.pathObj.dirArrs.length === 1 && shareQuery.value.share !== 0) {
      void store.triggerAlreadyShareDialog({
        localId: props.bucket_name,
        dirNames: { dirArrs: props.pathObj.dirArrs }
      })
    } else if (!props.pathObj.dirArrs && props.pathObj.fileArrs && props.pathObj.fileArrs.length === 1 && shareQuery.value.share !== 0) {
      void store.triggerAlreadyShareDialog({
        localId: props.bucket_name,
        dirNames: { fileArrs: props.pathObj.fileArrs }
      })
    }
    // if (shareQuery.value.share !== 0) {
    //   void store.triggerAlreadyShareDialog({
    //     localId: props.bucket_name,
    //     dirNames: { dirArrs: props.pathObj.dirArrs }
    //   })
    // }
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
