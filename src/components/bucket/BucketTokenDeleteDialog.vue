<script lang="ts" setup>
import { ref, onBeforeMount } from 'vue'
import { useStore } from 'stores/store'
import { i18n } from 'boot/i18n'

import { Notify, useDialogPluginComponent } from 'quasar'
import storage from 'src/api/index'

const props = defineProps({
  bucketName: {
    type: String,
    required: true
  },
  token: {
    type: String,
    required: true
  }
})
defineEmits([...useDialogPluginComponent.emits])

const store = useStore()
const { tc } = i18n.global
// code starts...

onBeforeMount(async () => {
  // 判断bucketToken表里有没有这项，没有就增加这项
  if (!store.tables.bucketTokenTable.allLocalIds.includes(props.bucketName)) {
    // await store.addBucketTokenTable({ bucket: props.bucketName }) todo 修改为新的参数
  }
})

const {
  dialogRef,
  onDialogHide,
  onDialogOK,
  onDialogCancel
} = useDialogPluginComponent()

const onCancelClick = onDialogCancel
const check = ref(false)

const onOKClick = async () => {
  try {
    // Notify.create({
    //   classes: 'notification-positive shadow-15',
    //   icon: 'las la-redo-alt',
    //   textColor: 'positive',
    //   message: '正在删除token...',
    //   position: 'bottom',
    //   closeBtn: true,
    //   timeout: 5000,
    //   multiLine: false
    // })
    const respDeleteToken = await storage.storage.api.deleteBucketToken({ path: { token: props.token } })

    if (respDeleteToken.status === 204) {
      await store.storeBucketToken({
        id: props.bucketName,
        value: store.tables.bucketTokenTable.byLocalId[props.bucketName].tokens.filter(token => token.key !== props.token)
      })
      Notify.create({
        classes: 'notification-positive shadow-15',
        icon: 'check_circle',
        textColor: 'positive',
        message: `${tc('成功删除token')}`,
        position: 'bottom',
        closeBtn: true,
        timeout: 5000,
        multiLine: false
      })
      onDialogOK()
    }
  } catch (error) {
    // do nothing
  }
}

</script>

<template>
  <!-- notice dialogRef here -->
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin dialog-primary">

      <q-card-section class="row items-center justify-center q-pb-md">
        <div class="text-primary">{{ tc('删除token') }}</div>
        <q-space/>
        <q-btn icon="close" flat dense size="sm" v-close-popup/>
      </q-card-section>

      <q-separator/>

      <q-card-section>

        <div class="row items-center">
          <div class="col-2 text-grey-7">
            {{ tc('所属存储桶') }}：
          </div>
          <div class="col">
            {{ props.bucketName }}
          </div>
        </div>

        <div class="row q-pt-lg items-center">
          <div class="col-2 text-grey-7">
            token:
          </div>
          <div class="col">
            {{ props.token }}
          </div>
        </div>

      </q-card-section>

      <q-separator/>

      <q-card-section>

        <div class="row items-center">
          <div class="col text-grey-7">
            {{ tc('请仔细阅读以下事项，并在确认后勾选') }}：
          </div>
        </div>

        <q-checkbox style="margin-left: -10px;" v-model="check" color="primary">
          <div :class="check?'text-primary':'text-black'">
            {{ tc('我了解删除的token将无法恢复') }}
          </div>
        </q-checkbox>

      </q-card-section>

      <q-separator/>

      <q-card-actions align="between">
        <q-btn class="q-ma-sm" color="negative" :label="tc('删除')" unelevated no-caps :disable="!check"
               @click="onOKClick"/>
        <q-btn class="q-ma-sm" color="primary" :label="tc('取消')" unelevated no-caps @click="onCancelClick"/>
      </q-card-actions>

    </q-card>
  </q-dialog>
</template>

<style lang="scss" scoped>
</style>
