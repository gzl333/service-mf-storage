<script setup lang="ts">
import { computed, ref, onBeforeMount } from 'vue'
// import { useStore } from 'stores/store'
import { useRoute/* , useRouter */ } from 'vue-router'
import { i18n } from 'boot/i18n'
import { Notify } from 'quasar'
import { navigateToUrl } from 'single-spa'
import storage from 'src/api'
import axios from 'axios'
import ShareTable from 'components/bucket/ShareTable.vue'

// const props = defineProps({
//   serviceId: {
//     type: String,
//     required: false,
//     default: ''
//   }
// })

// const emits = defineEmits(['change', 'delete'])
// console.log(props.serviceId)
// const store = useStore()
const route = useRoute()
// const router = useRouter()
const { tc } = i18n.global

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
const pathObj = computed(() => tableRow.value)
const localLogin = async () => {
  try {
    if (verifyPassword.value !== '') {
      const dataDre = await storage.storage.api.getShareBase({
        path: { share_base: shareBase },
        query: { p: verifyPassword.value }
      })
      if (dataDre.data.code === 200) {
        isPassword.value = false
        navigateToUrl('/storage/share/?base=' + route.query.base + '&p=' + verifyPassword.value)
      }
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
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
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
    }
  }
}
onBeforeMount(async () => {
  try {
    if (password) {
      const dataDre = await storage.storage.api.getShareBase({
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
      const dataDre = await storage.storage.api.getShareBase({
        path: { share_base: shareBase },
        query: { subpath: subPath }
      })
      if (dataDre.data.code === 200) {
        isPassword.value = false
        tableRow.value = dataDre.data
      }
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.data.code === 401) {
        isPassword.value = true
        isRight.value = false
      } else if (error.response?.data.code === 403) {
        isPassword.value = false
        isRight.value = true
        Notify.create({
          classes: 'notification-negative shadow-15',
          icon: 'las la-times-circle',
          textColor: 'negative',
          message: tc('您没有访问权限'),
          position: 'bottom',
          closeBtn: true,
          timeout: 5000,
          multiLine: false
        })
      } else if (error.response?.data.code === 404) {
        isPassword.value = false
        isRight.value = true
        Notify.create({
          classes: 'notification-negative shadow-15',
          icon: 'las la-times-circle',
          textColor: 'negative',
          message: tc('分享根目录不存在'),
          position: 'bottom',
          closeBtn: true,
          timeout: 5000,
          multiLine: false
        })
      }
    }
  }
})
</script>

<template>
  <div class="SharePathList">
    <!--    <div>serviceId: {{ serviceId }}</div>-->
    <!--    <div>shareBase: {{ shareBase }}</div>-->
    <!--    <div>subPath: {{ subPath }}</div>-->
    <!--    <div>password: {{ password }}</div>-->
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
    <div v-else-if="isRight"></div>
    <div class="q-pa-md" v-else>
      <share-table :pathObj="pathObj"/>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.SharePathList {
}
</style>
