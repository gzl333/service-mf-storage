<script lang="ts" setup>
import { PropType, ref, computed } from 'vue'
import { BucketInterface, useStore } from 'stores/store'
import { Notify, useDialogPluginComponent } from 'quasar'
import api from 'src/api/index'
import { i18n } from 'boot/i18n'

import useExceptionNotifier from 'src/hooks/useExceptionNotifier'

const props = defineProps({
  buckets: {
    type: Array as PropType<BucketInterface[]>,
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

// const currentService = computed(() => store.tables.serviceTable.byId[props.serviceId])
const exceptionNotifier = useExceptionNotifier()

const check1 = ref(false)
// const bucketIds = props.bucketNames.map((bucketName: string) => store.tables.bucketTable.byLocalId[props.serviceId + '/' + bucketName]?.id)
const isLoading = ref(false)

const buckets = computed(() => props.buckets)

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
    for (const bucket of buckets.value) {
      await api.vms.storage.deleteStorageBucket({
        path: {
          bucket_name: bucket.name,
          service_id: bucket.service.id
        }
      })
    }
    // reload bucket table
    void await store.loadBucketTable()

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

        <div v-for="bucket in buckets" :key="bucket.id"
             class="column q-mb-xs q-pa-md items-start bg-grey-2">

          <div class="col row items-center">
            <div class="col-auto text-grey-7">
              {{ tc('服务单元') }}：
            </div>
            <div class="col">
              {{ store.tables.serviceTable.byId[bucket?.service.id].name }}
            </div>
          </div>

          <div class="col row items-center">
            <div class="col-auto text-grey-7">
              {{ tc('存储桶名称') }}：
            </div>
            <div class="col">
              {{ bucket.name }}
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
