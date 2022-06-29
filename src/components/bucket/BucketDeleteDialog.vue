<script lang="ts" setup>
import { PropType, ref } from 'vue'
import { useStore } from 'stores/store'
import { Notify, useDialogPluginComponent } from 'quasar'
import storage from 'src/api/index'
// import { useI18n } from 'vue-i18n'

const props = defineProps({
  bucketNames: {
    type: Array as PropType<Array<string>>,
    required: true
  }
})
defineEmits([...useDialogPluginComponent.emits])

const store = useStore()
// const { locale } = useI18n({ useScope: 'global' })
// code starts...

const {
  dialogRef,
  onDialogHide,
  onDialogOK,
  onDialogCancel
} = useDialogPluginComponent()

const onCancelClick = onDialogCancel
const check1 = ref(false)
const bucketIds = props.bucketNames.map((bucketName: string) => store.tables.bucketTable.byLocalId[bucketName]?.id)

const onOKClick = async () => {
  try {
    Notify.create({
      classes: 'notification-positive shadow-15',
      icon: 'las la-redo-alt',
      textColor: 'positive',
      message: '正在删除存储桶...',
      position: 'bottom',
      closeBtn: true,
      timeout: 5000,
      multiLine: false
    })
    const respDeleteBuckets = await storage.storage.api.deleteBucketsIdOrName({
      path: {
        id_or_name: bucketIds[0].toString()
      },
      query: {
        'by-name': false,
        ids: bucketIds.slice(1)
      }
    })
    if (respDeleteBuckets.status === 204) {
      props.bucketNames.forEach((bucketName: string) => {
        store.deleteBucket({ id: bucketName })
      })
      Notify.create({
        classes: 'notification-positive shadow-15',
        icon: 'check_circle',
        textColor: 'positive',
        message: '成功删除存储桶',
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
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin dialog-negative">

      <q-card-section class="row items-center justify-center q-pb-md">
        <div class="text-negative">
          删除存储桶
<!--          {{ $t('删除存储桶') }}-->
        </div>
        <q-space/>
        <q-btn icon="close" flat dense size="sm" v-close-popup/>
      </q-card-section>

      <q-separator/>

      <q-card-section>

        <div class="row q-pb-md  items-center">
          <div class="col-auto text-grey-7">
            即将删除以下{{ props.bucketNames.length }}个存储桶：
          </div>
        </div>

        <div v-for="bucketName in props.bucketNames" :key="bucketName"
             class="row q-mb-xs q-pa-md items-center bg-grey-2">

          <div class="col row items-center">
            <div class="col-2 text-grey-7">
              存储桶名称
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
            请仔细阅读以下事项，并在确认后勾选：
          </div>
        </div>

        <q-checkbox style="margin-left: -10px;" v-model="check1" color="primary">
          <div :class="check1?'text-primary':'text-black'">
            我了解删除存储桶将会导致其内部文件丢失
<!--            {{ $t('我了解删除存储桶将会导致其内部文件丢失') }}-->
          </div>
        </q-checkbox>

      </q-card-section>

      <q-separator/>

      <q-card-actions align="between">
        <q-btn class="q-ma-sm" color="negative" label="删除" unelevated :disable="!check1" @click="onOKClick"/>
        <q-btn class="q-ma-sm" color="primary" label="取消" unelevated @click="onCancelClick"/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style lang="scss" scoped>

</style>
