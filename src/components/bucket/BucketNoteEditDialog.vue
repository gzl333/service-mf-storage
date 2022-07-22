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

const noteMaxLength = 50
const onCancelClick = onDialogCancel
const note = ref(store.tables.bucketTable.byLocalId[props.bucketName]?.remarks)

const inputRef = ref<QInput>()

const onOKClick = async () => {
  if (note.value.length < 1 || note.value.length > noteMaxLength) {
    Notify.create({
      classes: 'notification-negative shadow-15',
      icon: 'las la-times-circle',
      textColor: 'negative',
      // message: '备注长度应在1-' + noteMaxLength + '个字符之间',
      message: tc('备注长度应在1-50个字符之间'),
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
      message: `${tc('正在修改备注')}...`,
      position: 'bottom',
      closeBtn: true,
      timeout: 5000,
      multiLine: false
    })
    try {
      inputRef.value!.$props.loading = true
      await storage.storage.api.patchBucketsIdOrNameRemark({
        path: { id_or_name: props.bucketName },
        query: {
          'by-name': true,
          remarks: note.value
        }
      })
      await store.storeBucketNote({ id: props.bucketName, value: note.value })
      Notify.create({
        classes: 'notification-positive shadow-15',
        icon: 'check_circle',
        textColor: 'positive',
        message: tc('成功修改存储桶备注'),
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
<!--        <div class="text-primary">{{ '修改' + props.bucketName + '的备注' }}</div>-->
        <div class="text-primary">{{ tc('修改存储桶备注') }}</div>
        <q-space/>
        <q-btn icon="close" flat dense size="sm" v-close-popup/>
      </q-card-section>

      <q-separator/>

      <q-card-section>

        <div class="row q-pb-lg  items-center">
          <div class="col-2 text-grey-7">
            {{ tc('备注') }}
          </div>
          <div class="col">
            <q-input ref="inputRef" autofocus outlined v-model="note" dense clearable clear-icon="close"
                     :maxlength=noteMaxLength counter style="padding: 5px 0;" @keydown.enter="onOKClick">
            </q-input>
          </div>
        </div>

      </q-card-section>

      <q-separator/>

      <q-card-actions align="between">
        <q-btn class="q-ma-sm" color="primary" :label="tc('修改')" no-caps unelevated @click="onOKClick"/>
        <q-btn class="q-ma-sm" color="primary" :label="tc('取消')" no-caps unelevated @click="onCancelClick"/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style lang="scss" scoped>
</style>
