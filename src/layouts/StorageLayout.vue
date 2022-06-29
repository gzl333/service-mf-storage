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
const tc = i18n.global.tc

const activeItem = computed(() => store.items.currentPath[0])

const releaseTime = process.env.releaseTime

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
              :active="activeItem === 'bucket'"
              @click="activeItem = 'bucket'; navigateToUrl('/my/storage/bucket')"
              active-class="active-item"
            >
              <q-item-section class="column items-center">
                <q-icon name="lab la-bitbucket" size="lg"/>
                <div class="active-text text-center">{{ tc('存储桶') }}</div>
              </q-item-section>
            </q-item>

            <q-item
              clickable
              :active="activeItem === 'instructions'"
              @click="activeItem = 'instructions'; navigateToUrl('/my/storage/instructions')"
              active-class="active-item"
            >
              <q-item-section class="column items-center">
                <q-icon name="las la-exchange-alt" size="lg"/>
                <div class="active-text text-center">{{ tc('使用说明') }}</div>
              </q-item-section>
            </q-item>

          </q-list>

          <div class="text-grey text-body2 text-center q-pt-xl">v0.0.1</div>
          <div class="text-grey text-body2 text-center">{{ new Date(releaseTime).toLocaleString() }}</div>
        </q-scroll-area>
      </div>
    </q-drawer>

    <q-page-container>
      <q-scroll-area style="height: calc(100vh - 60px)">
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
