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
  },
  objpath: {
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
  if (dirName.value === '' || dirName.value === null) {
    Notify.create({
      classes: 'notification-negative shadow-15',
      icon: 'las la-times-circle',
      textColor: 'negative',
      message: `${tc('文件名称不能为空')}`,
      position: 'bottom',
      closeBtn: true,
      timeout: 5000,
      multiLine: false
    })
  } else if (dirName.value.length > 255) {
    Notify.create({
      classes: 'notification-negative shadow-15',
      icon: 'las la-times-circle',
      textColor: 'negative',
      message: `${tc('文件名称长度不能大于255个字符')}`,
      position: 'bottom',
      closeBtn: true,
      timeout: 5000,
      multiLine: false
    })
  } else if (dirName.value === props.objpath) {
    Notify.create({
      classes: 'notification-negative shadow-15',
      icon: 'las la-times-circle',
      textColor: 'negative',
      message: `${tc('文件名称未改变')}`,
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
      message: `${tc('正在修改名称中')}`,
      position: 'bottom',
      closeBtn: true,
      timeout: 5000,
      multiLine: false
    })
    try {
      const respGetDir = await storage.storage.api.postObjPath({ path: { objpath: props.objpath, bucket_name: props.bucket_name }, query: { rename: dirName.value } })
      await store.changeObjName({
        item: {
          bucket_name: props.bucket_name,
          dirName: props.objpath,
          newName: respGetDir.data.obj.name
        }
      })
      Notify.create({
        classes: 'notification-positive shadow-15',
        icon: 'check_circle',
        textColor: 'positive',
        message: `${tc('重命名成功')}`,
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
const dirName = ref(props.objpath)
const inputRef = ref<QInput>()
</script>

<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin dialog-primary">

      <q-card-section class="row items-center justify-center q-pb-md">
        <div class="text-primary">
          {{ tc('文件重命名') }}
        </div>
        <q-space/>
        <q-btn icon="close" flat dense size="sm" v-close-popup/>
      </q-card-section>

      <q-separator/>

      <q-card-section>

        <div class="row q-pb-lg  items-center">
          <div class="col-2 text-grey-7">
            {{ tc('文件名称') }}
          </div>
          <div class="col">
            <q-input ref="inputRef" autofocus outlined v-model="dirName" dense clearable clear-icon="close" style="padding: 5px 0;" @keydown.enter="onOKClick">
            </q-input>
          </div>
        </div>

      </q-card-section>

      <q-separator/>

      <q-card-actions align="between">
        <q-btn class="q-ma-sm" color="primary" :label="tc('确认')" no-caps unelevated @click="onOKClick"/>
        <q-btn class="q-ma-sm" color="primary" :label="tc('取消')" no-caps unelevated @click="onCancelClick"/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style lang="scss" scoped>
</style>
