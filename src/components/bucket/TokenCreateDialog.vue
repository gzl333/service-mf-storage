<script lang="ts" setup>
import { useStore } from 'stores/store'
import { Notify, QBtn, useDialogPluginComponent } from 'quasar'
import { i18n } from 'boot/i18n'
import api from 'src/api/index'
import emitter from 'boot/mitt'
const props = defineProps({
  serviceId: {
    type: String,
    required: true
  }
})

defineEmits([...useDialogPluginComponent.emits])

const store = useStore()
const { tc } = i18n.global

const {
  dialogRef,
  onDialogHide,
  onDialogOK,
  onDialogCancel
} = useDialogPluginComponent()
const onCancelClick = onDialogCancel

const onOKClick = async () => {
  Notify.create({
    classes: 'notification-positive shadow-15',
    icon: 'check_circle',
    textColor: 'positive',
    message: `${tc('正在刷新token')}`,
    position: 'bottom',
    // closeBtn: true,
    timeout: 5000,
    multiLine: true
  })
  await api.storage.storage.putAuthToken({ base: store.tables.serviceTable.byId[props.serviceId]?.endpoint_url })
  // store.tables.authTokenTable.byId[props.serviceId] = respGetToken.data.token
  emitter.emit('tokenRefresh', true)
  onDialogOK()
  Notify.create({
    classes: 'notification-positive shadow-15',
    icon: 'check_circle',
    textColor: 'positive',
    message: `${tc('token刷新成功')}`,
    position: 'bottom',
    // closeBtn: true,
    timeout: 5000,
    multiLine: true
  })
}

</script>

<template>
  <!-- notice dialogRef here -->
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin dialog-primary">

      <q-card-section class="row items-center justify-center q-pb-md">
        <div class="text-primary">
          {{ tc('新建token') }}
        </div>
        <q-space/>
        <q-btn icon="close" flat dense size="sm" v-close-popup/>
      </q-card-section>
      <q-separator/>
      <q-card-section class="text-center">
        <q-icon name="las la-exclamation-circle" size="5rem" color="orange"></q-icon>
        <div class="text-h6 q-mt-md">确定刷新token吗？</div>
        <div>此操作会重新创建一个token，旧token将失效</div>
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
               @click="onOKClick">
          {{ tc('创建') }}
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style lang="scss" scoped>
</style>
