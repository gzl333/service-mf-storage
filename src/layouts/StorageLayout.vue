<script setup lang="ts">
import { computed } from 'vue'
import { navigateToUrl } from 'single-spa'
import { useStore } from 'stores/store'
// import { useRoute, useRouter } from 'vue-router'
import { i18n } from 'boot/i18n'
// import DownloadProgress from 'components/bucket/DownloadProgress.vue'
// const props = defineProps({
//   foo: {
//     type: String,
//     required: false,
//     default: ''
//   }
// })
// const emits = defineEmits(['change', 'delete'])

const store = useStore()
// const route = useRoute()
// const router = useRouter()
const { tc } = i18n.global

// the root layout of @cnic/storage, load @cnic/storage's store here
console.log('@cnic/storage store:', store.$state)
void store.loadAllTables()

// 哪个item为active完全读取自url，而非本地设置、读取值
// 以bucket+serviceId为标识
const activeItemLabel = computed(() => store.items.currentPath[0] + store.items.currentPath[1])

const releaseTime = process.env.releaseTime

// const services = computed(() => Object.values(store.tables.serviceTable.byId))
// const isOpen = ref(false)
// const expandDetails = () => {
//   isOpen.value = !isOpen.value
// }
</script>

<template>
  <q-layout view="hHh LpR fFf">
    <q-drawer :model-value="true" style="padding-top: 60px;" :breakpoint="0" side="left" width="120" bordered>

      <div class="column full-height bg-grey-2">
        <q-scroll-area class="col non-selectable" visible>

          <q-list>

            <q-item>
              <q-item-section class="column items-center q-py-sm text-center text-weight-bold text-grey-8">
                {{ tc('对象存储') }}
              </q-item-section>
            </q-item>

            <q-item
              clickable
              :active="activeItemLabel.includes('bucket')"
              @click="navigateToUrl('/my/storage/bucket/all')"
              active-class="active-item"
            >
              <q-item-section class="column items-center">
                <q-icon name="mdi-database" size="lg"/>
                <div class="active-text text-center">{{ tc('存储桶') }}</div>
              </q-item-section>
            </q-item>

<!--            <q-item-->
<!--              v-for="service in services"-->
<!--              :id="service.id"-->
<!--              :key="service.id"-->
<!--              clickable-->
<!--              :active="activeItemLabel.includes(service.id)"-->
<!--              @click="navigateToUrl(`/my/storage/service/${service.id}`)"-->
<!--              active-class="active-item"-->
<!--            >-->
<!--              <q-item-section class="column items-center">-->
<!--                <q-icon name="las la-server" size="lg"/>-->
<!--                <div class="active-text text-center">-->
<!--                  {{ i18n.global.locale === 'zh' ? service.name : service.name_en }}-->
<!--                </div>-->
<!--              </q-item-section>-->
<!--            </q-item>-->

            <q-item
              clickable
              :active="activeItemLabel.startsWith('voucher')"
              @click="navigateToUrl('/my/storage/voucher')"
              active-class="active-item"
            >
              <q-item-section class="column items-center">
                <q-icon name="currency_yuan" size="lg"/>
                <div class="active-text text-center">{{ tc('代金券') }}</div>
              </q-item-section>
            </q-item>

            <q-item
              clickable
              :active="activeItemLabel.startsWith('search')"
              @click="navigateToUrl('/my/storage/search')"
              active-class="active-item"
            >
              <q-item-section class="column items-center">
                <q-icon name="search" size="lg"/>
                <div class="active-text text-center">{{ tc('综合检索') }}</div>
              </q-item-section>
            </q-item>

            <q-item
              clickable
              :active="activeItemLabel.startsWith('security')"
              @click="navigateToUrl('/my/storage/security')"
              active-class="active-item"
            >
              <q-item-section class="column items-center">
                <q-icon name="lock_outline" size="lg"/>
                <div class="active-text text-center">{{ tc('安全凭证') }}</div>
              </q-item-section>
            </q-item>

<!--            <q-item-->
<!--              clickable-->
<!--              :active="activeItemLabel.startsWith('backup')"-->
<!--              @click="navigateToUrl('/my/storage/backup')"-->
<!--              active-class="active-item"-->
<!--            >-->
<!--              <q-item-section class="column items-center">-->
<!--                <q-icon name="backup" size="lg"/>-->
<!--                <div class="active-text text-center">{{ tc('数据备份') }}</div>-->
<!--              </q-item-section>-->
<!--            </q-item>-->

            <q-item
              clickable
              :active="activeItemLabel.startsWith('instructions')"
              @click="navigateToUrl('/my/storage/instructions')"
              active-class="active-item"
            >
              <q-item-section class="column items-center">
                <q-icon name="help_outline" size="lg"/>
                <div class="active-text text-center">{{ tc('使用说明') }}</div>
              </q-item-section>
            </q-item>

          </q-list>

          <div class="row justify-center q-pt-lg">
            <q-btn flat no-caps no-wrap color="primary" :ripple="false" dense @click="store.redeemCouponDialog()">
              {{ tc('兑换代金券') }}
            </q-btn>
          </div>

          <!--          <div class="text-grey text-body2 text-center q-pt-xl">v0.0.1</div>-->
          <div class="row justify-center q-mt-sm">
            <q-btn no-caps unelevated class="q-px-sm" color="primary" icon="las la-cloud-download-alt" label="下载队列" @click="store.triggerDownloadProgressDialog()" >
              <q-badge color="red" floating v-show="store.items.waitQueue.length + store.items.downQueue.length !== 0">
                {{ store.items.waitQueue.length + store.items.downQueue.length }}
              </q-badge>
            </q-btn>
          </div>
          <div class="row justify-center q-pt-lg">
            <q-icon class="text-center" name="info" color="grey-5" size="xs">
              <q-tooltip class="bg-grey-3">
                <div class="text-grey text-caption text-center">{{ tc('发布时间') }}</div>
                <div class="text-grey text-caption text-center">
                  {{ new Date(releaseTime).toLocaleString(i18n.global.locale) }}
                </div>
              </q-tooltip>
            </q-icon>
          </div>
          <!--          <div class="text-grey text-body2 text-center">{{ new Date(releaseTime).toLocaleString() }}</div>-->
        </q-scroll-area>
      </div>
    </q-drawer>
    <q-page-container>
      <q-scroll-area style="height: calc(100vh - 60px); min-width: 1290px;">
        <router-view class="q-pa-md" :key="$route.fullPath"/>
<!--        <q-page-sticky position="top-left" :offset="[250, 7]">-->
<!--          <div class="row">-->
<!--            <div @click="expandDetails">-->
<!--              <q-btn style="height: 45px" class="no-border-radius" color="primary" icon="las la-cloud-download-alt" label="下载任务" />-->
<!--              <q-btn style="height: 45px" class="no-border-radius q-px-xs" color="primary" :icon="isOpen ? 'las la-angle-left' : 'las la-angle-right'"/>-->
<!--            </div>-->
<!--            <transition name="slide-fade">-->
<!--              <q-card flat bordered class="text-black no-border-radius q-px-sm" v-show="isOpen">-->
<!--                <q-card-actions>-->
<!--                  <div v-if="store.items.downQueue.length > 0">-->
<!--                    <span>{{ '正在下载文件：' + store.items.downQueue.length }}</span>-->
<!--                    <span class="q-ml-md">{{ '等待下载文件：' + store.items.waitQueue.length }}</span>-->
<!--                  </div>-->
<!--                  <div v-else>当前暂无下载任务</div>-->
<!--                  <q-btn dense class="q-ml-md" size="md" color="primary" label="查看下载进度" @click="store.triggerDownloadProgressDialog()" />-->
<!--                </q-card-actions>-->
<!--              </q-card>-->
<!--            </transition>-->
<!--          </div>-->
<!--        </q-page-sticky>-->
<!--        <q-page-sticky position="top-left" :offset="[350, 0]">-->
<!--          <div class="q-pa-md" style="width: 670px">-->
<!--            <q-expansion-item-->
<!--              class="shadow-1 overflow-hidden"-->
<!--              style="border-radius: 30px"-->
<!--              header-class="bg-primary text-white"-->
<!--              expand-icon-class="text-white"-->
<!--            >-->
<!--              <template v-slot:header>-->
<!--                <q-item-section avatar>-->
<!--                  <q-icon color="white" name="las la-cloud-download-alt" size="sm"/>-->
<!--                </q-item-section>-->
<!--                <q-item-section>-->
<!--                  <div v-if="store.items.downQueue.length !== 0">-->
<!--                    <span>{{ '正在下载文件数：' + store.items.downQueue.length + '个' }}</span>-->
<!--                    <span class="q-ml-md">{{ '等待下载文件数：' + store.items.waitQueue.length + '个' }}</span>-->
<!--                  </div>-->
<!--                  <div v-else>当前暂无下载任务</div>-->
<!--                </q-item-section>-->
<!--                <div>-->
<!--                  <q-btn icon="las la-play-circle" outline class="q-px-xs" color="white" label="全部开始" @click.stop="allStart" />-->
<!--                  <q-btn icon="las la-power-off" outline class="q-px-xs q-ml-xs" color="white" label="全部取消" @click.stop="allStop" />-->
<!--                </div>-->
<!--              </template>-->
<!--              <q-card>-->
<!--                <download-progress/>-->
<!--              </q-card>-->
<!--            </q-expansion-item>-->
<!--          </div>-->
<!--        </q-page-sticky>-->
      </q-scroll-area>
    </q-page-container>

  </q-layout>
</template>

<style lang="scss" scoped>
.active-item {
  background-color: #DBF0FC; // $grey-4;

  .active-text {
    color: $primary;
  }
}
//.v-enter-active,
//.v-leave-active {
//  transition: opacity 0.5s ease;
//}
//
//.v-enter-from,
//.v-leave-to {
//  opacity: 0;
//}
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(20px);
  opacity: 0;
}
</style>
