<script lang="ts" setup>
import { ref } from 'vue'
import { useStore } from 'stores/store'
import { i18n } from 'boot/i18n'

import { Notify, QInput, useDialogPluginComponent } from 'quasar'
import storage from 'src/api/index'

const props = defineProps({
  bucketName: {
    type: String,
    required: true
  },
  isRo: {
    type: Boolean,
    required: true
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
const password = ref(store.tables.bucketTable.byLocalId[props.bucketName][props.isRo ? 'ftp_ro_password' : 'ftp_password'] || '')

const inputRef = ref<QInput>()

const onOKClick = async () => {
  if (password.value.length < 6 || password.value.length > 20) {
    Notify.create({
      classes: 'notification-negative shadow-15',
      icon: 'las la-times-circle',
      textColor: 'negative',
      message: '密码长度应为6-30个字符',
      position: 'bottom',
      closeBtn: true,
      timeout: 5000,
      multiLine: false
    })
  } else {
    Notify.create({
      classes: 'notification-positive shadow-15',
      icon: 'las la-redo-alt',
      textColor: 'positive',
      message: '正在修改FTP密码...',
      position: 'bottom',
      closeBtn: true,
      timeout: 5000,
      multiLine: false
    })
    try {
      inputRef.value!.$props.loading = true
      const respPatchFtpPassword = await storage.storage.api.patchFtpBucketName({
        path: { bucket_name: props.bucketName },
        query: props.isRo ? { ro_password: password.value } : { password: password.value }
      })
      await store.storeFtpPassword({ id: props.bucketName, field: props.isRo ? 'ftp_ro_password' : 'ftp_password', value: props.isRo ? respPatchFtpPassword.data.data.ro_password : respPatchFtpPassword.data.data.password })
      Notify.create({
        classes: 'notification-positive shadow-15',
        icon: 'check_circle',
        textColor: 'positive',
        message: '成功修改FTP密码',
        position: 'bottom',
        closeBtn: true,
        timeout: 5000,
        multiLine: false
      })
      onDialogOK()
    } catch (error: unknown) {
      inputRef.value!.focus()
      // leave it to axios
    }
  }
}
</script>

<template>
  <!-- notice dialogRef here -->
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin dialog-primary">

      <q-card-section class="row items-center justify-center q-pb-md">
        <div class="text-primary">{{ '修改' + props.bucketName + '的FTP密码' }}</div>
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
        <q-btn class="q-ma-sm" color="primary" :label="tc('修改')" unelevated @click="onOKClick"/>
        <q-btn class="q-ma-sm" color="primary" :label="tc('取消')" unelevated @click="onCancelClick"/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style lang="scss" scoped>
</style>
