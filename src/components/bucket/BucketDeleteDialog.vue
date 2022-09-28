<script lang="ts" setup>
import { PropType, ref, computed } from 'vue'
import { useStore } from 'stores/store'
import { Notify, useDialogPluginComponent } from 'quasar'
import api from 'src/api/index'
import { i18n } from 'boot/i18n'

import useExceptionNotifier from 'src/hooks/useExceptionNotifier'

const props = defineProps({
  serviceId: {
    type: String,
    required: true
  },
  bucketNames: {
    type: Array as PropType<string[]>,
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

const currentService = computed(() => store.tables.serviceTable.byId[props.serviceId])
const exceptionNotifier = useExceptionNotifier()

const check1 = ref(false)
const bucketIds = props.bucketNames.map((bucketName: string) => store.tables.bucketTable.byLocalId[props.serviceId + '/' + bucketName]?.id)
const isLoading = ref(false)

const onOKClick = async () => {
  isLoading.value = true
  const dismissWorking = Notify.create({
    classes: 'notification-positive shadow-15',
    icon: 'las la-redo-alt',
    textColor: 'positive',
    message: `${tc('正在删除存储桶')}...`,
    position: 'bottom',
    // closeBtn: true,
    // timeout: 5000,
    multiLine: true
  })
  try {
    // req
    await api.storage.single.deleteBucketsIdOrName({
      base: currentService.value.endpoint_url,
      path: {
        id_or_name: bucketIds[0].toString()
      },
      query: {
        'by-name': false,
        ids: bucketIds.slice(1)
      }
    })

    // delete bucket in table
    props.bucketNames.forEach((bucketName: string) => {
      const currentLocalId = props.serviceId + '/' + bucketName
      store.tables.bucketTable.allLocalIds = store.tables.bucketTable.allLocalIds.filter((localId: string) => localId !== currentLocalId)
      delete store.tables.bucketTable.byLocalId[currentLocalId]
    })

    // close working notification
    dismissWorking()
    isLoading.value = false

    // success notification
    Notify.create({
      classes: 'notification-positive shadow-15',
      icon: 'check_circle',
      textColor: 'positive',
      message: `${tc('成功删除存储桶')}`,
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
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin dialog-negative">

      <q-card-section class="row items-center justify-center q-pb-md">
        <div class="text-negative">
          {{ tc('删除存储桶') }}
        </div>
        <q-space/>
        <q-btn icon="close" flat dense size="sm" v-close-popup/>
      </q-card-section>

      <q-separator/>

      <q-card-section>

        <div class="row q-pb-md  items-center">
          <div class="col-auto text-grey-7">
            <!--            即将删除以下{{ props.bucketNames.length }}个存储桶：-->
            {{ tc('以下存储桶将被删除：') }}
          </div>
        </div>

        <div v-for="bucketName in props.bucketNames" :key="bucketName"
             class="row q-mb-xs q-pa-md items-center bg-grey-2">

          <div class="col row items-center">
            <div class="col-auto text-grey-7">
              {{ tc('存储桶名称') }}：
            </div>
            <div class="col">
              {{ bucketName }}
            </div>
          </div>

        </div>

      </q-card-section>

      <q-separator/>

      <q-card-section>

        <div class="row items-center">
          <div class="col text-grey-7">
            {{ tc('请仔细阅读以下事项，并在确认后勾选：') }}
          </div>
        </div>

        <q-checkbox style="margin-left: -10px;" v-model="check1" color="primary">
          <div :class="check1?'text-primary':'text-black'">
            {{ tc('我了解删除存储桶将会导致其内部文件丢失') }}
          </div>
        </q-checkbox>

      </q-card-section>

      <q-separator/>

      <q-card-actions align="between">
        <q-btn
          class="q-ma-sm"
          color="primary"
          no-caps
          unelevated
          @click="onCancelClick"
        >
          {{ tc('取消') }}
        </q-btn>

        <q-btn
          class="q-ma-sm"
          color="negative"
          no-caps
          unelevated
          :disable="!check1"
          :loading="isLoading"
          @click="onOKClick"
        >
          {{ tc('删除') }}
        </q-btn>

      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style lang="scss" scoped>

</style>
