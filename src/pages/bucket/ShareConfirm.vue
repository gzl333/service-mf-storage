<script lang="ts" setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import storage from 'src/api/index'
import { Notify } from 'quasar'

const $route = useRoute()
const $router = useRouter()
const password = ref('')
const localLogin = async () => {
  try {
    const str = $route.query.path
    const dataDre = await storage.storage.api.getShareBase({ path: { share_base: str }, query: { p: password.value } })
    if (dataDre.data.code === 200) {
      void await $router.push({
        path: '/share/s/' + $route.query.path,
        query: { p: password.value }
      })
      password.value = ''
    }
  } catch (error: unknown) {
    if (error.response.data.code === 401) {
      Notify.create({
        classes: 'notification-negative shadow-15',
        icon: 'las la-times-circle',
        textColor: 'negative',
        message: '密码不正确',
        position: 'bottom',
        closeBtn: true,
        timeout: 5000,
        multiLine: false
      })
    }
  }
}
</script>

<template>
  <div class="ShareConfirm">
    <div class="row justify-center q-mt-xl">
      <q-form>
        <q-card class="shadow-24" style="width: 400px;">
          <q-card-section class="row justify-center items-center">
            <div class="col text-subtitle1">验证密码</div>
          </q-card-section>
          <q-card-section class="column items-center justify-center q-gutter-y-sm">
            <q-input class="col-auto" style="width: 365px;" v-model="password" outlined dense placeholder="密码">
              <template v-slot:prepend>
                <q-icon name="las la-lock" color="grey"/>
              </template>
              <template v-slot:append>
                <q-icon v-if="password !== ''" name="las la-times" @click="password = ''"
                        class="cursor-pointer"/>
              </template>
            </q-input>
          </q-card-section>
          <q-card-section class="column items-center justify-center q-gutter-y-sm">
            <q-btn class="col-auto" style="width: 365px; height: 40px;" label="确定"
                   color="primary" unelevated :ripple="false" @click="localLogin"/>
          </q-card-section>
        </q-card>
      </q-form>
    </div>
  </div>
</template>

<style scoped>

</style>
