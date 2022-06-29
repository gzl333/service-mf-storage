<script lang="ts" setup>
import { ref } from 'vue'
import { useStore } from 'stores/store'
import { Notify, QInput, useDialogPluginComponent } from 'quasar'
import storage from 'src/api/index'

const props = defineProps({
  bucket_name: {
    type: String,
    required: true
  }
})
const store = useStore()
defineEmits([...useDialogPluginComponent.emits])

const {
  dialogRef,
  onDialogHide,
  onDialogOK,
  onDialogCancel
} = useDialogPluginComponent()

const onOKClick = async () => {
  if (dirName.value === null || dirName.value.length < 3 || dirName.value.length > 64) {
    Notify.create({
      classes: 'notification-negative shadow-15',
      icon: 'las la-times-circle',
      textColor: 'negative',
      message: '文件夹名称长度应为3-63个字符',
      position: 'bottom',
      closeBtn: true,
      timeout: 5000,
      multiLine: false
    })
  } else {
    inputRef.value!.$props.loading = true
    try {
      const respGetDir = await storage.storage.api.postDirPath({ path: { dirpath: dirName.value, bucket_name: props.bucket_name } })
      await store.storeSingleFileItem({ item: { files: respGetDir.data.dir, bucket_name: props.bucket_name } })
      Notify.create({
        classes: 'notification-positive shadow-15',
        icon: 'check_circle',
        textColor: 'positive',
        message: '创建文件夹成功',
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
          新建文件夹
<!--          {{ $t('新建文件夹') }}-->
        </div>
        <q-space/>
        <q-btn icon="close" flat dense size="sm" v-close-popup/>
      </q-card-section>

      <q-separator/>

      <q-card-section>

        <div class="row q-pb-lg  items-center">
          <div class="col-2 text-grey-7">
            文件夹名称
          </div>
          <div class="col">
            <q-input ref="inputRef" autofocus outlined v-model="dirName" dense clearable clear-icon="close"
                     maxlength="63" counter style="padding: 5px 0;" @keydown.enter="onOKClick">
            </q-input>
          </div>
        </div>

        <div class="row q-pb-lg items-start">
          <div class="col-2 text-grey-7">
            名称规则
          </div>
          <div class="col">
            长度介于3-63个字符之间
          </div>
        </div>

      </q-card-section>

      <q-separator/>

      <q-card-actions align="between">
        <q-btn class="q-ma-sm" color="primary" label="创建" unelevated @click="onOKClick"/>
        <q-btn class="q-ma-sm" color="primary" label="取消" unelevated @click="onCancelClick"/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style lang="scss" scoped>
</style>
