<script lang="ts" setup>
import { ref } from 'vue'
import { useStore } from 'stores/store'
import { i18n } from 'boot/i18n'

import { Notify, QInput, useDialogPluginComponent } from 'quasar'
import storage from 'src/api/index'
import axios from 'axios'

// const props = defineProps({
//   foo: {
//     type: String,
//     required: false,
//     default: ''
//   }
// })
defineEmits([...useDialogPluginComponent.emits])

const store = useStore()
const { tc } = i18n.global
// code starts...

// REQUIRED; must be called inside of setup()
const {
  dialogRef,
  onDialogHide,
  onDialogOK,
  onDialogCancel
} = useDialogPluginComponent()

const onOKClick = async () => {
  // validate bucket name, todo refine reg exp
  if (bucketName.value.length < 3 || bucketName.value.length > 64) {
    Notify.create({
      classes: 'notification-negative shadow-15',
      icon: 'las la-times-circle',
      textColor: 'negative',
      message: '桶名称长度应为3-63个字符',
      position: 'bottom',
      closeBtn: true,
      timeout: 5000,
      multiLine: false
    })
  } else {
    inputRef.value!.$props.loading = true
    Notify.create({
      classes: 'notification-positive shadow-15',
      icon: 'las la-redo-alt',
      textColor: 'positive',
      message: '正在创建存储桶：' + bucketName.value,
      position: 'bottom',
      closeBtn: true,
      timeout: 5000,
      multiLine: false
    })
    // submit creation
    try {
      const respPostBuckets = await storage.storage.api.postBuckets({ body: { name: bucketName.value } })
      // console.log(respPostBuckets.data)
      // const data = {
      //   code: 201,
      //   code_text: '创建成功',
      //   data: {
      //     name: 'test2'
      //   },
      //   bucket: {
      //     id: 152777,
      //     name: 'test2',
      //     user: {
      //       id: 577,
      //       username: 'zlguo@cnic.cn'
      //     },
      //     created_time: '2022-01-28T10:33:00.921597+08:00',
      //     access_permission: '私有',
      //     ftp_enable: false,
      //     ftp_password: 'f2461dd903',
      //     ftp_ro_password: '513f879336',
      //     remarks: ''
      //   }
      // }
      await store.storeBucket({ table: store.tables.bucketTable, item: { [respPostBuckets.data.bucket.name]: Object.assign(respPostBuckets.data.bucket, { localId: respPostBuckets.data.bucket.name }) } })
      Notify.create({
        classes: 'notification-positive shadow-15',
        icon: 'check_circle',
        textColor: 'positive',
        message: '成功创建存储桶：' + bucketName.value,
        position: 'bottom',
        closeBtn: true,
        timeout: 5000,
        multiLine: false
      })
      onDialogOK()
    } catch (error: unknown) {
      // fail to create
      inputRef.value!.$props.loading = false
      inputRef.value!.focus()
      if (axios.isAxiosError(error)) {
        if (error.response?.data.code === 'BucketAlreadyOwnedByYou') {
          Notify.create({
            classes: 'notification-negative shadow-15',
            icon: 'mdi-alert',
            textColor: 'negative',
            message: '请输入其它名称',
            caption: '您已经拥有同名称的存储桶',
            position: 'bottom',
            closeBtn: true,
            timeout: 5000,
            multiLine: false
          })
        } else if (error.response?.data.code === 'BucketAlreadyExists') {
          Notify.create({
            classes: 'notification-negative shadow-15',
            icon: 'mdi-alert',
            textColor: 'negative',
            message: '请输入其它名称',
            caption: bucketName.value + '已经被其他用户占用',
            position: 'bottom',
            closeBtn: true,
            timeout: 5000,
            multiLine: false
          })
        }
      } else {
        Notify.create({
          classes: 'notification-negative shadow-15',
          icon: 'mdi-alert',
          textColor: 'negative',
          message: '创建存储桶失败',
          caption: '请重试',
          position: 'bottom',
          closeBtn: true,
          timeout: 5000,
          multiLine: false
        })
      }
    }
  }
}
const onCancelClick = onDialogCancel
const bucketName = ref('')
const inputRef = ref<QInput>()
</script>

<template>
  <!-- notice dialogRef here -->
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin dialog-primary">

      <q-card-section class="row items-center justify-center q-pb-md">
        <div class="text-primary">
          {{ tc('新建存储桶') }}
        </div>
        <q-space/>
        <q-btn icon="close" flat dense size="sm" v-close-popup/>
      </q-card-section>

      <q-separator/>

      <q-card-section>

        <div class="row q-pb-lg  items-center">
          <div class="col-2 text-grey-7">
            {{ tc('存储桶名称') }}
          </div>
          <div class="col">
            <q-input ref="inputRef" autofocus outlined v-model="bucketName" dense clearable clear-icon="close"
                     maxlength="63" counter style="padding: 5px 0;" @keydown.enter="onOKClick">
            </q-input>
          </div>
        </div>

        <div class="row q-pb-lg items-start">
          <div class="col-2 text-grey-7">
            {{ tc('名称规则') }}
          </div>
          <div class="col">
            {{ tc('长度介于3-63个字符之间，可输入小写英文字母、数字或者-（连字符），但-（连字符）不允许在开头和结尾') }}
          </div>
        </div>

      </q-card-section>

      <q-separator/>

      <q-card-actions align="between">
        <q-btn class="q-ma-sm" color="primary" :label="tc('创建')" unelevated @click="onOKClick"/>
        <q-btn class="q-ma-sm" color="primary" :label="tc('取消')" unelevated @click="onCancelClick"/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style lang="scss" scoped>
</style>
