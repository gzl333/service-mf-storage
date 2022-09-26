<script lang="ts" setup>
import { onBeforeMount } from 'vue'
import { useStore } from 'stores/store'
import { i18n } from 'boot/i18n'
import { Notify, useDialogPluginComponent } from 'quasar'
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

// top level await: https://stackoverflow.com/questions/69183835/vue-script-setup-top-level-await-causing-template-not-to-render
onBeforeMount(async () => {
  // 判断bucketToken表里有没有这项，没有就增加这项
  if (!store.tables.bucketTokenTable.allLocalIds.includes(props.bucketName)) {
    // await store.addBucketTokenTable({ bucket: props.bucketName }) todo 修改为新的
  }
})

const {
  dialogRef,
  onDialogHide,
  onDialogOK,
  onDialogCancel
} = useDialogPluginComponent()

const onCancelClick = onDialogCancel

const onOKClick = async (permission: 'readwrite' | 'readonly') => {
  try {
    // Notify.create({
    //   classes: 'notification-positive shadow-15',
    //   icon: 'las la-redo-alt',
    //   textColor: 'positive',
    //   message: '正在创建token...',
    //   position: 'bottom',
    //   closeBtn: true,
    //   timeout: 5000,
    //   multiLine: false
    // })
    const respPostBucketTokenCreate = await storage.storage.api.postBucketsIdOrNameTokenCreate({
      path: { id_or_name: props.bucketName },
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
    await store.storeBucketToken({ id: props.bucketName, value: [...store.tables.bucketTokenTable.byLocalId[props.bucketName].tokens, respPostBucketTokenCreate.data] })
    Notify.create({
      classes: 'notification-positive shadow-15',
      icon: 'check_circle',
      textColor: 'positive',
      message: tc('成功创建存储桶token'),
      position: 'bottom',
      closeBtn: true,
      timeout: 5000,
      multiLine: false
    })
    onDialogOK()
  } catch (error: unknown) {
    // leave it to axios
  }
}

</script>

<template>
  <!-- notice dialogRef here -->
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin dialog-primary">

      <q-card-section class="row items-center justify-center q-pb-md">
<!--        <div class="text-primary">{{ '为' + props.bucketName + '创建token' }}</div>-->
        <div class="text-primary">{{ tc('为存储桶创建token') }}</div>
        <q-space/>
        <q-btn icon="close" flat dense size="sm" v-close-popup/>
      </q-card-section>

      <q-separator/>

      <q-card-section>

        <div class="row items-center">
          <div class="col-3 text-grey-7">
            {{ `token  ${tc('数量s')}: ${store.tables.bucketTokenTable.byLocalId[props.bucketName]?.tokens.length}` }}
          </div>
<!--          <div class="col">-->
<!--            {{ store.tables.bucketTokenTable.byLocalId[props.bucketName]?.tokens.length }}-->
<!--          </div>-->
        </div>

        <div class="row q-pt-lg items-center"
             v-for="(token, index) in store.tables.bucketTokenTable.byLocalId[props.bucketName]?.tokens"
             :key="index">
          <div class="col-2 text-grey-7">
            {{ 'token' + (index + 1) }}
          </div>
          <div class="col">
            {{ token.key }}
          </div>
        </div>

      </q-card-section>

      <q-separator/>

      <q-card-actions align="between">
        <div class="q-ma-sm row items-center">
          <q-btn color="primary" :label="tc('创建读写token')" unelevated no-caps
                 :disable="store.tables.bucketTokenTable.byLocalId[props.bucketName]?.tokens.length===2"
                 @click="onOKClick('readwrite')"/>
          <q-btn class="q-mx-md" color="primary" :label="tc('创建只读token')" unelevated no-caps
                 :disable="store.tables.bucketTokenTable.byLocalId[props.bucketName]?.tokens.length===2"
                 @click="onOKClick('readonly')"/>
          <div v-if="store.tables.bucketTokenTable.byLocalId[props.bucketName]?.tokens.length===2"
               class="text-negative">
            {{ tc('已达最大token数量') }}
          </div>
        </div>
        <q-btn class="q-ma-sm" color="primary" :label="tc('取消')" unelevated no-caps @click="onCancelClick"/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style lang="scss" scoped>
</style>
