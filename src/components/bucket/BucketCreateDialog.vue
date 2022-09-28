<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useStore } from 'stores/store'
import { Notify, QBtn, QInput, useDialogPluginComponent } from 'quasar'
import { i18n } from 'boot/i18n'
import api from 'src/api/index'

import useExceptionNotifier from 'src/hooks/useExceptionNotifier'

const props = defineProps({
  serviceId: {
    type: String,
    required: true,
    default: ''
  }
})
defineEmits([...useDialogPluginComponent.emits])

const store = useStore()
const { tc } = i18n.global
// code starts...

const {
  dialogRef,
  onDialogHide,
  onDialogOK,
  onDialogCancel
} = useDialogPluginComponent()
const onCancelClick = onDialogCancel

const currentService = computed(() => store.tables.serviceTable.byId[props.serviceId])
const exceptionNotifier = useExceptionNotifier()

const bucketName = ref('')
const isLoading = ref(false)
const inputRef = ref<QInput>()

const onOKClick = async () => {
  // validate bucket name, todo refine reg exp
  if (bucketName.value.length < 3 || bucketName.value.length > 64) {
    inputRef.value!.focus()
    Notify.create({
      classes: 'notification-negative shadow-15',
      icon: 'las la-times-circle',
      textColor: 'negative',
      message: `${tc('桶名称长度应为3-63个字符')}`,
      position: 'bottom',
      // closeBtn: true,
      timeout: 5000,
      multiLine: true
    })
  } else {
    isLoading.value = true
    const dismissWorking = Notify.create({
      classes: 'notification-positive shadow-15',
      icon: 'las la-redo-alt',
      textColor: 'positive',
      spinner: true,
      message: `${tc('正在创建存储桶')}  ${bucketName.value}`,
      position: 'bottom',
      // closeBtn: true,
      // timeout: 5000,
      multiLine: true
    })
    // submit creation
    try {
      // req
      const respPostBuckets = await api.storage.single.postBuckets({
        base: currentService.value?.endpoint_url,
        body: { name: bucketName.value }
      })

      // store new bucket in table
      Object.assign(store.tables.bucketTable.byLocalId, {
        [props.serviceId + '/' + respPostBuckets.data.bucket.name]: Object.assign(respPostBuckets.data.bucket, {
          local_id: respPostBuckets.data.bucket.name,
          service_id: props.serviceId
        })
      })
      store.tables.bucketTable.allLocalIds.unshift(props.serviceId + '/' + respPostBuckets.data.bucket.name)
      store.tables.bucketTable.allLocalIds = [...new Set(store.tables.bucketTable.allLocalIds)]

      // close working notification
      dismissWorking()
      isLoading.value = false

      // success notification
      Notify.create({
        classes: 'notification-positive shadow-15',
        icon: 'check_circle',
        textColor: 'positive',
        message: `${tc('成功创建存储桶')}  ${bucketName.value}`,
        position: 'bottom',
        closeBtn: true,
        timeout: 5000,
        multiLine: false
      })

      // close dialog
      onDialogOK()
    } catch (exception) {
      inputRef.value!.focus()
      dismissWorking()
      isLoading.value = false
      exceptionNotifier(exception)
    }
  }
}

</script>

<template>
  <!-- notice dialogRef here -->
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin dialog-primary">

      <q-card-section class="row items-center justify-center q-pb-md">
        <div class="text-primary">
          {{ tc('新建存储桶') }}
        </div>
        <q-space/>
        <q-btn icon="close" flat dense size="sm" v-close-popup/>
      </q-card-section>

      <q-separator/>

      <q-card-section>

        <div class="row q-pb-lg  items-center">
          <div class="col-2 text-grey-7">
            {{ tc('存储桶名称') }}
          </div>
          <div class="col">
            <q-input ref="inputRef" autofocus outlined v-model="bucketName" dense clearable clear-icon="close"
                     maxlength="63" counter style="padding: 5px 0;" @keydown.enter="onOKClick">
            </q-input>
          </div>
        </div>

        <div class="row q-pb-lg items-start">
          <div class="col-2 text-grey-7">
            {{ tc('名称规则') }}
          </div>
          <div class="col">
            {{ tc('长度介于3-63个字符之间，可输入小写英文字母、数字或者-（连字符），但-（连字符）不允许在开头和结尾') }}
          </div>
        </div>

      </q-card-section>

      <q-separator/>

      <q-card-actions align="between">

        <q-btn class="q-ma-sm"
               color="primary"
               no-caps
               unelevated
               @click="onCancelClick">
          {{ tc('取消') }}
        </q-btn>

        <q-btn class="q-ma-sm"
               color="primary"
               no-caps
               unelevated
               :loading="isLoading"
               @click="onOKClick">
          {{ tc('创建') }}
        </q-btn>

      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style lang="scss" scoped>
</style>
