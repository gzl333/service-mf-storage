<script setup lang="ts">
// import { ref, computed } from "vue"
import { navigateToUrl } from 'single-spa'
import { useStore } from 'stores/store'
import { useRoute/* , useRouter */ } from 'vue-router'
import { computed } from 'vue'
import useClipText from 'src/hooks/useClipText'
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
const route = useRoute()
// const router = useRouter()
const { tc } = i18n.global

const currentBucketId = store.items.currentPath[1]
const currentBucket = computed(() => store.tables.bucketTable.byId[currentBucketId])
const currentService = computed(() => store.tables.serviceTable.byId[currentBucket.value.service.id])

const path = route.query.path as string
const arrayPaths = computed(() => path?.split('/')[0] === '' ? [] : path?.split('/'))

// 把过长的文本缩短
const clipText7 = useClipText(7)
const clipText70 = useClipText(70)

</script>

<template>

  <div class="row non-selectable">

    <q-breadcrumbs class="col-auto text-black">

      <template v-slot:separator>
        <q-icon
          size="xs"
          name="chevron_right"
          color="grey"
        />
      </template>

      <q-breadcrumbs-el @click="navigateToUrl('/my/storage/bucket/all')">
        <div class="row items-center no-wrap cursor-pointer">
          <div class="col-auto" :class="currentBucketId === 'all' ? 'text-bold':''">
            {{ tc('全部存储桶') }}
          </div>
        </div>
      </q-breadcrumbs-el>

      // 桶名称
      <q-breadcrumbs-el v-if="currentBucket"
                        @click="navigateToUrl('/my/storage/bucket/' + currentBucket.id)">
        <div class="row items-center no-wrap cursor-pointer" :class="path ? '':'text-bold'">
          <div class="col-auto ">
            {{ i18n.global.locale === 'zh' ? currentService?.name : currentService?.name_en }} -
          </div>
          <q-icon class="col-auto" size="xs" color="primary" name="mdi-database"/>
          <div class="col-auto">
            {{ currentBucket.name }}
          </div>
        </div>
      </q-breadcrumbs-el>

      // 文件夹部分，除了最后一个
      <q-breadcrumbs-el v-for="(path, index) in arrayPaths?.slice(0, -1)" :key="path"
                        @click="navigateToUrl('/my/storage/bucket/' + currentBucket.id + '/object' +'?path=' + arrayPaths.slice(0, (index - arrayPaths.length + 1)).reduce((accumulator, item) => accumulator + '/' + item))">
        <div class="row items-center no-wrap cursor-pointer">
          <q-icon class="col-auto" size="xs" color="yellow-8" name="folder"/>
          <div class="col-auto"> {{ clipText7(path) }}</div>
        </div>
        <q-tooltip>{{ path }}</q-tooltip>
      </q-breadcrumbs-el>

      // 最后一个文件夹
      <q-breadcrumbs-el v-if="arrayPaths?.length > 0">
        <div class="row items-center no-wrap">
          <q-icon class="col-auto" size="xs" color="yellow-8" name="folder"/>
          <div class="col-auto text-bold"> {{ clipText70(arrayPaths?.slice(-1)[0]) }}</div>
        </div>
      </q-breadcrumbs-el>

    </q-breadcrumbs>
  </div>
</template>

<style lang="scss" scoped>
</style>
