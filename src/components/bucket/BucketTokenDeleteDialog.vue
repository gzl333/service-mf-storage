<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useStore } from 'stores/store'
import { i18n } from 'boot/i18n'
import { Notify, useDialogPluginComponent } from 'quasar'
import api from 'src/api/index'

import useExceptionNotifier from 'src/hooks/useExceptionNotifier'

const props = defineProps({
  bucketId: {
    type: String,
    required: true,
    default: ''
  },
  tokenKey: {
    type: String,
    required: true
  }
})
defineEmits([...useDialogPluginComponent.emits])

const store = useStore()
const { tc } = i18n.global
// code starts...

// onBeforeMount(async () => {
//   // 判断bucketToken表里有没有这项，没有就增加这项
//   if (!store.tables.bucketTokenTable.allLocalIds.includes(props.bucketName)) {
//     // await store.addBucketTokenTable({ bucket: props.bucketName }) todo 修改为新的参数
//   }
// })

const {
  dialogRef,
  onDialogHide,
  onDialogOK,
  onDialogCancel
} = useDialogPluginComponent()

const currentBucket = computed(() => store.tables.bucketTable.byId[props.bucketId])
const currentService = computed(() => store.tables.serviceTable.byId[currentBucket.value?.service.id])
const exceptionNotifier = useExceptionNotifier()
const onCancelClick = onDialogCancel
const check = ref(false)
const isLoading = ref(false)

const onOKClick = async () => {
  // init
  isLoading.value = true
  const dismissWorking = Notify.create({
    classes: 'notification-positive shadow-15',
    icon: 'las la-redo-alt',
    textColor: 'positive',
    spinner: true,
    message: `${tc('正在删除token:')}  ${props.tokenKey}`,
    position: 'bottom',
    // closeBtn: true,
    // timeout: 5000,
    multiLine: true
  })
  try {
    // req
    void await api.storage.single.deleteBucketToken({
      base: currentService.value?.endpoint_url,
      path: { token: props.tokenKey }
    })

    // update tokens
    store.tables.bucketTokenTable.byId[props.bucketId].tokens =
      store.tables.bucketTokenTable.byId[props.bucketId].tokens.filter(token => token.key !== props.tokenKey)

    // close working notification
    dismissWorking()
    isLoading.value = false

    // success notification
    Notify.create({
      classes: 'notification-positive shadow-15',
      icon: 'check_circle',
      textColor: 'positive',
      message: `${tc('成功删除token')}`,
      position: 'bottom',
      // closeBtn: true,
      timeout: 5000,
      multiLine: true
    })
    // close dialog
    onDialogOK()
  } catch (exception) {
    dismissWorking()
    isLoading.value = false
    exceptionNotifier(exception)
  }
}

</script>

<template>
  <!-- notice dialogRef here -->
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin dialog-negative">

      <q-card-section class="row items-center justify-center q-pb-md">
        <div class="text-negative">{{ tc('删除token') }}</div>
        <q-space/>
        <q-btn icon="close" flat dense size="sm" v-close-popup/>
      </q-card-section>

      <q-separator/>

      <q-card-section>

        <div class="row items-center q-pb-md">
          <div class="col-3 text-grey-7">
            {{ tc('所属服务单元') }}：
          </div>
          <div class="col">
            {{ i18n.global.locale === 'zh' ? currentService?.name : currentService?.name_en }}
          </div>
        </div>

        <div class="row items-center q-pb-md">
          <div class="col-3 text-grey-7">
            {{ tc('所属存储桶') }}：
          </div>
          <div class="col">
            {{ currentBucket?.name }}
          </div>
        </div>

        <div class="row items-center">
          <div class="col-3 text-grey-7">
            token:
          </div>
          <div class="col">
            {{ tokenKey }}
          </div>
        </div>

      </q-card-section>

      <q-separator/>

      <q-card-section>

        <div class="row items-center">
          <div class="col text-grey-7">
            {{ tc('请仔细阅读以下事项，并在确认后勾选') }}：
          </div>
        </div>

        <q-checkbox style="margin-left: -10px;" v-model="check" color="primary">
          <div :class="check?'text-primary':'text-black'">
            {{ tc('我了解删除的token将无法恢复') }}
          </div>
        </q-checkbox>

      </q-card-section>

      <q-separator/>

      <q-card-actions align="between">
        <q-btn class="q-ma-sm" color="primary" :label="tc('取消')" unelevated no-caps @click="onCancelClick"/>
        <q-btn class="q-ma-sm" color="negative" :label="tc('删除')" unelevated no-caps :disable="!check"
               @click="onOKClick"/>
      </q-card-actions>

    </q-card>
  </q-dialog>
</template>

<style lang="scss" scoped>
</style>
