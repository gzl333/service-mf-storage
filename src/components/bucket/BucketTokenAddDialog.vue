<script lang="ts" setup>
import { computed, ref } from 'vue'
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
  }
})
defineEmits([...useDialogPluginComponent.emits])

const store = useStore()
const { tc } = i18n.global

const {
  dialogRef,
  onDialogHide,
  // onDialogOK,
  onDialogCancel
} = useDialogPluginComponent()

const currentBucket = computed(() => store.tables.bucketTable.byId[props.bucketId])
const currentService = computed(() => store.tables.serviceTable.byId[currentBucket.value.service.id])
const currentTokenSet = computed(() => store.tables.bucketTokenTable.byId[props.bucketId])
const exceptionNotifier = useExceptionNotifier()
const onCancelClick = onDialogCancel
const isLoading = ref(false)

const onOKClick = async (permission: 'readwrite' | 'readonly') => {
  // init
  isLoading.value = true
  const dismissWorking = Notify.create({
    classes: 'notification-positive shadow-15',
    icon: 'las la-redo-alt',
    textColor: 'positive',
    spinner: true,
    message: `${tc('正在创建存储桶token')}...`,
    position: 'bottom',
    // closeBtn: true,
    // timeout: 5000,
    multiLine: true
  })
  try {
    // req
    const respPostBucketTokenCreate = await api.storage.single.postBucketsIdOrNameTokenCreate({
      base: currentService.value?.endpoint_url,
      path: { id_or_name: currentBucket.value.name },
      query: {
        'by-name': true,
        permission
      }
    })

    // const data = {
    //   key: 'b827137ecfcxxxxxxxxxxxxxxxf2f4d22cdbfff4fb1',
    //   bucket: {
    //     id: 152786,
    //     name: '11111'
    //   },
    //   permission: 'readwrite',
    //   created: '2022-02-09T16:21:06.171897+08:00'
    // }

    // update tokens
    store.tables.bucketTokenTable.byId[props.bucketId].tokens =
      [...store.tables.bucketTokenTable.byId[props.bucketId].tokens, respPostBucketTokenCreate.data]

    // close working notification
    dismissWorking()
    isLoading.value = false

    // success notification
    Notify.create({
      classes: 'notification-positive shadow-15',
      icon: 'check_circle',
      textColor: 'positive',
      message: tc('成功创建存储桶token'),
      position: 'bottom',
      // closeBtn: true,
      timeout: 5000,
      multiLine: true
    })

    // close dialog
    // onDialogOK()
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
    <q-card class="q-dialog-plugin dialog-primary">

      <q-card-section class="row items-center justify-center q-pb-md">
        <!--        <div class="text-primary">{{ '为' + props.bucketName + '创建token' }}</div>-->
        <div class="text-primary">{{ tc('存储桶创建token') }}</div>
        <q-space/>
        <q-btn icon="close" flat dense size="sm" v-close-popup/>
      </q-card-section>

      <q-separator/>

      <q-card-section>

        <div class="row items-center q-pb-md">
          <div class="col-3 text-grey-7">
            {{ tc('所属服务单元') }}
          </div>
          <div class="col">
            {{ i18n.global.locale === 'zh' ? currentService.name : currentService.name_en }}
          </div>
        </div>

        <div class="row items-center q-pb-md">
          <div class="col-3 text-grey-7">
            {{ tc('存储桶') }}
          </div>
          <div class="col">
            {{ currentBucket.name }}
          </div>
        </div>

        <div class="row items-center">
          <div class="col-3 text-grey-7">
            {{ tc('当前token数量') }}
          </div>
          <div class="col">
            {{ currentTokenSet.tokens.length }}
          </div>
        </div>

      </q-card-section>

      <q-separator/>

      <q-card-actions align="between">

        <q-btn class="q-ma-sm" color="primary" :label="tc('取消')" unelevated no-caps @click="onCancelClick"/>

        <div class="q-ma-sm row items-center justify-end q-gutter-x-md">
          <q-btn class="col-auto" color="primary" :label="tc('创建读写token')" unelevated no-caps
                 @click="onOKClick('readwrite')"/>
          <q-btn class="col-auto" color="primary" :label="tc('创建只读token')" unelevated no-caps
                 @click="onOKClick('readonly')"/>
        </div>

      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style lang="scss" scoped>
</style>
