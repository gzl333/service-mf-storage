<script lang="ts" setup>
import { ref } from 'vue'
import { useStore } from 'stores/store'
import { Notify, QInput, useDialogPluginComponent } from 'quasar'
import storage from 'src/api/index'
import { i18n } from 'boot/i18n'

const props = defineProps({
  bucket_name: {
    type: String,
    required: true
  }
})
const store = useStore()
const { tc } = i18n.global
defineEmits([...useDialogPluginComponent.emits])

const {
  dialogRef,
  onDialogHide,
  onDialogOK,
  onDialogCancel
} = useDialogPluginComponent()

const onOKClick = async () => {
  if (dirName.value === null || dirName.value === '') {
    Notify.create({
      classes: 'notification-negative shadow-15',
      icon: 'las la-times-circle',
      textColor: 'negative',
      message: tc('文件夹名称不能为空'),
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
      message: `${tc('正在创建文件夹')}`,
      position: 'bottom',
      closeBtn: true,
      timeout: 5000,
      multiLine: false
    })
    try {
      const respGetDir = await storage.storage.api.postDirPath({ path: { dirpath: dirName.value, bucket_name: props.bucket_name } })
      await store.storeSingleFileItem({ item: { files: respGetDir.data.dir, bucket_name: props.bucket_name } })
      Notify.create({
        classes: 'notification-positive shadow-15',
        icon: 'check_circle',
        textColor: 'positive',
        message: `${tc('创建文件夹成功')}`,
        position: 'bottom',
        closeBtn: true,
        timeout: 5000,
        multiLine: false
      })
      onDialogOK()
    } catch (error: unknown) {
      inputRef.value!.$props.loading = false
      inputRef.value!.focus()
    }
  }
}
const onCancelClick = onDialogCancel
const dirName = ref('')
const inputRef = ref<QInput>()
</script>

<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin dialog-primary">

      <q-card-section class="row items-center justify-center q-pb-md">
        <div class="text-primary">
          {{ tc('新建文件夹') }}
        </div>
        <q-space/>
        <q-btn icon="close" flat dense size="sm" v-close-popup/>
      </q-card-section>

      <q-separator/>

      <q-card-section>

        <div class="row q-pb-lg  items-center">
          <div class="col-2 text-grey-7">
            {{ tc('文件夹名称') }}
          </div>
          <div class="col">
            <q-input ref="inputRef" autofocus outlined v-model="dirName" dense clearable clear-icon="close" style="padding: 5px 0;" @keydown.enter="onOKClick">
            </q-input>
          </div>
        </div>

      </q-card-section>

      <q-separator/>

      <q-card-actions align="between">
        <q-btn class="q-ma-sm" color="primary" :label="tc('创建')" no-caps unelevated @click="onOKClick"/>
        <q-btn class="q-ma-sm" color="primary" :label="tc('取消')" no-caps unelevated @click="onCancelClick"/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style lang="scss" scoped>
</style>
