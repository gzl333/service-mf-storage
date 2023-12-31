<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute/* , useRouter */ } from 'vue-router'
import { useStore } from 'stores/store'
import { i18n } from 'boot/i18n'
import { Notify } from 'quasar'
import { navigateToUrl } from 'single-spa'
import api from 'src/api'
import ShareTable from 'components/bucket/ShareTable.vue'

const props = defineProps({
  serviceId: {
    type: String,
    required: false,
    default: ''
  }
})

// const emits = defineEmits(['change', 'delete'])
const store = useStore()
const route = useRoute()
// const router = useRouter()
const { tc } = i18n.global

// the root layout of @cnic/storage, load @cnic/storage's store here
// console.log('@cnic/storage store:', store.$state)
// void store.loadAllTables()
// 接收url结构： siteURL/(serviceId/)?base=xxx&sub=xxx&p=xxx
// http://servicedev.cstcloud.cn/storage/share/?base=xxx&sub=yyy&p=zzz
// http://servicedev.cstcloud.cn/storage/share/123?base=xxx&sub=yyy&p=zzz
const shareBase = route.query.base as string // string or undefined
const subPath = route.query.sub as string
const password = route.query.p as string
const isPassword = ref(false)
const isRight = ref(false)
const tableRow = ref([])
const verifyPassword = ref('')
const message = ref('')
const currentService = computed(() => store.tables.serviceTable.byId[props.serviceId])
const pathObj = computed(() => tableRow.value)
const localLogin = async () => {
  if (verifyPassword.value !== '') {
    await api.storage.single.getShareBase({
      base: currentService.value?.endpoint_url,
      path: { share_base: shareBase },
      query: { p: verifyPassword.value }
    }).then((dataDre) => {
      if (dataDre.data.code === 200) {
        isPassword.value = false
        navigateToUrl('/storage/share/' + props.serviceId + '?base=' + route.query.base + '&p=' + verifyPassword.value)
      }
    }).catch((error) => {
      if (error.response?.data.code === 401) {
        Notify.create({
          classes: 'notification-negative shadow-15',
          icon: 'las la-times-circle',
          textColor: 'negative',
          message: tc('密码不正确'),
          position: 'bottom',
          closeBtn: true,
          timeout: 5000,
          multiLine: false
        })
      }
    })
  } else {
    Notify.create({
      classes: 'notification-negative shadow-15',
      icon: 'las la-times-circle',
      textColor: 'negative',
      message: tc('请输入密码'),
      position: 'bottom',
      closeBtn: true,
      timeout: 5000,
      multiLine: false
    })
  }
}
const loadTables = async () => {
  if (password) {
    const dataDre = await api.storage.single.getShareBase({
      base: currentService.value?.endpoint_url,
      path: { share_base: shareBase },
      query: {
        subpath: subPath,
        p: password
      }
    })
    if (dataDre.data.code === 200) {
      isPassword.value = false
      tableRow.value = dataDre.data
    }
  } else {
    await api.storage.single.getShareBase({
      base: currentService.value?.endpoint_url,
      path: { share_base: shareBase },
      query: { subpath: subPath }
    }).then((dataDre) => {
      if (dataDre.data.code === 200) {
        isPassword.value = false
        tableRow.value = dataDre.data
      }
    }).catch((error) => {
      if (error.response?.data.code === 'InvalidShareCode') {
        isPassword.value = true
        isRight.value = false
      } else if (error.response?.data.code === 'NotShared') {
        isPassword.value = false
        isRight.value = true
        message.value = '您没有访问权限'
      } else if (error.response?.data.code === 'NotFound') {
        isPassword.value = false
        isRight.value = true
        message.value = '分享根目录不存在'
      }
    })
  }
}
// setup时调用一次
if (currentService.value) {
  void loadTables()
}
// 刷新页面时，等待有效的service信息，再调用
const unwatch = watch(currentService, () => {
  if (currentService.value?.endpoint_url) {
    // serviceTable已经加载，可以发送请求
    void loadTables()
    // watcher已完成任务，注销
    unwatch()
  }
})
</script>

<template>
  <div class="SharePathList">
    <div class="row justify-center q-mt-xl" v-if="isPassword">
      <q-form>
        <q-card class="shadow-24" style="width: 400px;">
          <q-card-section class="row justify-center items-center">
            <div class="col text-subtitle1">{{ tc('输入密码') }}</div>
          </q-card-section>
          <q-card-section class="column items-center justify-center q-gutter-y-sm">
            <q-input class="col-auto" style="width: 365px;" v-model.trim="verifyPassword" outlined dense
                     :placeholder="tc('密码')">
              <template v-slot:prepend>
                <q-icon name="las la-lock" color="grey"/>
              </template>
              <template v-slot:append>
                <q-icon v-if="verifyPassword !== ''" name="las la-times" @click="verifyPassword = ''"
                        class="cursor-pointer"/>
              </template>
            </q-input>
          </q-card-section>
          <q-card-section class="column items-center justify-center q-gutter-y-sm">
            <q-btn class="q-px-xl" :label="tc('确认')" color="primary" unelevated no-caps :ripple="false"
                   @click="localLogin"/>
          </q-card-section>
        </q-card>
      </q-form>
    </div>
    <div v-else-if="isRight" class="row">
      <q-card flat bordered class="my-card col-2 text-center text-subtitle1">
        <q-card-section>
          {{ tc(message) }}
        </q-card-section>
      </q-card>
    </div>
    <div class="q-pa-md" v-else>
      <share-table :pathObj="pathObj"/>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.SharePathList {
}
</style>
