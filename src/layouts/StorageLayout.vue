<script setup lang="ts">
import { computed } from 'vue'
import { navigateToUrl } from 'single-spa'
import { useStore } from 'stores/store'
// import { useRoute, useRouter } from 'vue-router'
import { i18n } from 'boot/i18n'

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

const services = computed(() => Object.values(store.tables.serviceTable.byId))
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
              v-for="service in services"
              :id="service.id"
              :key="service.id"
              clickable
              :active="activeItemLabel === `service${service.id}`"
              @click="navigateToUrl(`/my/storage/service/${service.id}`)"
              active-class="active-item"
            >
              <q-item-section class="column items-center">
                <q-icon name="las la-server" size="lg"/>
                <div class="active-text text-center">
                  {{ i18n.global.locale === 'zh' ? service.name : service.name_en }}
                </div>
              </q-item-section>
            </q-item>

            <q-item
              clickable
              :active="activeItemLabel === 'search'"
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
              :active="activeItemLabel === 'instructionsundefined'"
              @click="navigateToUrl('/my/storage/instructions')"
              active-class="active-item"
            >
              <q-item-section class="column items-center">
                <q-icon name="help_outline" size="lg"/>
                <div class="active-text text-center">{{ tc('使用说明') }}</div>
              </q-item-section>
            </q-item>

          </q-list>

          <!--          <div class="text-grey text-body2 text-center q-pt-xl">v0.0.1</div>-->
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
</style>
