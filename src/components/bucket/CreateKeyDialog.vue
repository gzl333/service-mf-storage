<script lang="ts" setup>
import { useStore } from 'stores/store'
import { Notify, QBtn, useDialogPluginComponent } from 'quasar'
import { i18n } from 'boot/i18n'
import api from 'src/api/index'
import $bus from 'src/hooks/bus'
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
  await api.storage.storage.postAuthKey({ base: store.tables.serviceTable.byId[props.serviceId]?.endpoint_url })
  // const keyObj = {
  //   access_key: respGetKeys.data.key.access_key,
  //   create_time: respGetKeys.data.key.create_time,
  //   permission: respGetKeys.data.key.permission,
  //   secret_key: respGetKeys.data.key.secret_key,
  //   state: respGetKeys.data.key.state,
  //   user: respGetKeys.data.key.user,
  //   service: props.serviceId
  // }
  // 往store中添加访问密匙
  // Object.assign(store.tables.keyPairTable.byId, {
  //   [respGetKeys.data.key.access_key]: keyObj
  // })
  // store.tables.keyPairTable.allIds.unshift(respGetKeys.data.key.access_key)
  // store.tables.keyPairTable.allIds = [...new Set(store.tables.keyPairTable.allIds)]
  $bus.emit('keysRefresh', true)
  onDialogOK()
  Notify.create({
    classes: 'notification-positive shadow-15',
    icon: 'check_circle',
    textColor: 'positive',
    message: `${tc('创建成功')}`,
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
          {{ tc('创建访问密钥') }}
        </div>
        <q-space/>
        <q-btn icon="close" flat dense size="sm" v-close-popup/>
      </q-card-section>
      <q-separator/>
      <q-card-section class="text-center">
        <q-icon name="las la-exclamation-circle" size="5rem" color="orange"></q-icon>
        <div class="text-h6 q-mt-md">{{ '确认要创建新的访问密钥吗？' }}</div>
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
