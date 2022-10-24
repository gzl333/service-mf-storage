<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useStore } from 'stores/store'
import { i18n } from 'boot/i18n'
import { Notify, QInput, useDialogPluginComponent } from 'quasar'
import storage from 'src/api/index'

import useExceptionNotifier from 'src/hooks/useExceptionNotifier'

const props = defineProps({
  bucketId: {
    type: String,
    required: true,
    default: ''
  },
  isRo: {
    type: Boolean,
    required: true,
    default: true
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

const currentBucket = computed(() => store.tables.bucketTable.byId[props.bucketId])
const currentService = computed(() => store.tables.serviceTable.byId[currentBucket.value?.service.id])
const password = ref(currentBucket.value.detail[props.isRo ? 'ftp_ro_password' : 'ftp_password'] || '')
const inputRef = ref<QInput>()
const isLoading = ref(false)
const exceptionNotifier = useExceptionNotifier()

const onCancelClick = onDialogCancel
const onOKClick = async () => {
  if (password.value.length < 6 || password.value.length > 20) {
    inputRef.value!.focus()
    Notify.create({
      classes: 'notification-negative shadow-15',
      icon: 'las la-times-circle',
      textColor: 'negative',
      message: `${tc('密码长度应为6-20个字符')}`,
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
      message: `${tc('正在修改FTP密码')}...`,
      position: 'bottom',
      // closeBtn: true,
      // timeout: 5000,
      multiLine: false
    })
    try {
      // req
      const respPatchFtpPassword = await storage.storage.single.patchFtpBucketName({
        base: currentService?.value.endpoint_url,
        path: { bucket_name: currentBucket.value.name },
        query: props.isRo ? { ro_password: password.value } : { password: password.value }
      })

      // store new password in table
      if (props.isRo) {
        currentBucket.value.detail.ftp_ro_password = respPatchFtpPassword.data.data.ro_password
      } else {
        currentBucket.value.detail.ftp_password = respPatchFtpPassword.data.data.password
      }

      // close working notification
      dismissWorking()
      isLoading.value = false

      // success notification
      Notify.create({
        classes: 'notification-positive shadow-15',
        icon: 'check_circle',
        textColor: 'positive',
        message: `${tc('成功修改FTP密码')}`,
        position: 'bottom',
        // closeBtn: true,
        timeout: 5000,
        multiLine: true
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
        <!--        <div class="text-primary">{{ '修改' + props.bucketName + '的FTP密码' }}</div>-->
        <div class="text-primary">
          {{ currentBucket.name }}-{{ props.isRo ? tc('修改FTP只读密码') : tc('修改FTP密码') }}
        </div>
        <q-space/>
        <q-btn icon="close" flat dense size="sm" v-close-popup/>
      </q-card-section>

      <q-separator/>

      <q-card-section>

        <div class="row q-pb-lg  items-center">
          <div class="col-2 text-grey-7">
            {{ props.isRo ? tc('只读密码') : tc('读写密码') }}
          </div>
          <div class="col">
            <q-input ref="inputRef" autofocus outlined v-model="password" dense clearable clear-icon="close"
                     maxlength="20" counter style="padding: 5px 0;" @keydown.enter="onOKClick">
            </q-input>
          </div>
        </div>

      </q-card-section>

      <q-separator/>

      <q-card-actions align="between">
        <q-btn class="q-ma-sm" color="primary" :label="tc('取消')" no-caps unelevated @click="onCancelClick"/>
        <q-btn class="q-ma-sm" color="primary" :label="tc('修改')" no-caps unelevated @click="onOKClick"/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style lang="scss" scoped>
</style>
