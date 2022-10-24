<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useStore } from 'stores/store'
import { i18n } from 'boot/i18n'
import { Notify, QBtn, QInput, useDialogPluginComponent } from 'quasar'
import api from 'src/api/index'

import useExceptionNotifier from 'src/hooks/useExceptionNotifier'

const props = defineProps({
  bucketId: {
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

const MAX_LENGTH = 50

const currentBucket = computed(() => store.tables.bucketTable.byId[props.bucketId])
const currentService = computed(() => store.tables.serviceTable.byId[currentBucket.value?.service.id])

const note = ref<string>(currentBucket.value?.detail.remarks || '')
const exceptionNotifier = useExceptionNotifier()
const isLoading = ref(false)
const inputRef = ref<QInput>()

const onCancelClick = onDialogCancel
const onOKClick = async () => {
  if (note.value?.length < 1 || note.value?.length > MAX_LENGTH) {
    inputRef.value!.focus()
    Notify.create({
      classes: 'notification-negative shadow-15',
      icon: 'las la-times-circle',
      textColor: 'negative',
      // message: '备注长度应在1-' + noteMaxLength + '个字符之间',
      message: tc('备注长度应在1-50个字符之间'),
      position: 'bottom',
      // closeBtn: true,
      timeout: 5000,
      multiLine: true
    })
  } else {
    // init
    isLoading.value = true
    const dismissWorking = Notify.create({
      classes: 'notification-positive shadow-15',
      icon: 'las la-redo-alt',
      textColor: 'positive',
      spinner: true,
      message: `${tc('正在修改备注')}...`,
      position: 'bottom',
      // closeBtn: true,
      // timeout: 5000,
      multiLine: true
    })
    try {
      // req
      void await api.storage.single.patchBucketsIdOrNameRemark({
        base: currentService.value?.endpoint_url,
        path: { id_or_name: currentBucket.value.name },
        query: {
          'by-name': true,
          remarks: note.value
        }
      })

      // update note
      currentBucket.value.detail.remarks = note.value

      // close working notification
      dismissWorking()
      isLoading.value = false

      // success notification
      Notify.create({
        classes: 'notification-positive shadow-15',
        icon: 'check_circle',
        textColor: 'positive',
        message: tc('成功修改存储桶备注'),
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
        <!--        <div class="text-primary">{{ '修改' + props.bucketName + '的备注' }}</div>-->
        <div class="text-primary">{{ tc('修改存储桶备注') }}</div>
        <q-space/>
        <q-btn icon="close" flat dense size="sm" v-close-popup/>
      </q-card-section>

      <q-separator/>

      <q-card-section>

        <div class="row q-pb-lg  items-center">
          <div class="col-2 text-grey-7">
            {{ tc('存储桶') }}
          </div>
          <div class="col">
            {{ currentBucket.name }}
          </div>
        </div>

        <div class="row q-pb-lg  items-center">
          <div class="col-2 text-grey-7">
            {{ tc('备注') }}
          </div>
          <div class="col">
            <q-input ref="inputRef"
                     autofocus
                     outlined
                     v-model="note"
                     dense
                     clearable
                     clear-icon="close"
                     :maxlength=MAX_LENGTH
                     counter
                     style="padding: 5px 0;"
                     @keydown.enter="onOKClick"
            >
            </q-input>
          </div>
        </div>

      </q-card-section>

      <q-separator/>

      <q-card-actions align="between">
        <q-btn class="q-ma-sm" color="primary" :label="tc('取消')" no-caps unelevated @click="onCancelClick"/>
        <q-btn class="q-ma-sm" color="primary" :label="tc('修改')" no-caps unelevated :loading="isLoading"
               @click="onOKClick"/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style lang="scss" scoped>
</style>
