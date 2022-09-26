<script setup lang="ts">
import { /* ref, */ computed, watch } from 'vue'
import { navigateToUrl } from 'single-spa'
import { useStore } from 'stores/store'
import { useRoute/* , useRouter */ } from 'vue-router'
import { i18n } from 'boot/i18n'

import PathTable from 'components/bucket/PathTable.vue'
import useFormatSize from 'src/hooks/useFormatSize'

const props = defineProps({
  serviceId: {
    type: String,
    required: false,
    default: ''
  },
  bucketName: {
    type: String,
    required: false,
    default: ''
  },
  tabId: {
    type: String,
    required: false
  }
})
// const emits = defineEmits(['change', 'delete'])

const { tc } = i18n.global
const store = useStore()
const route = useRoute()
// const router = useRouter()

const tab = computed(() => props.tabId)

// 如果没传tab，则跳转到tab=object
if (!store.items.currentPath[4]) {
  navigateToUrl(route.path.endsWith('/') ? route.path + 'object' : route.path + '/object')
}

const currentService = computed(() => store.tables.serviceTable.byId[props.serviceId])
const currentBucket = computed(() => store.tables.bucketTable.byLocalId[props.bucketName])
const currentBucketStat = computed(() => store.tables.bucketStatTable.byLocalId[props.bucketName])
const currentBucketToken = computed(() => store.tables.bucketTokenTable.byLocalId[props.bucketName])

/* 获取相关table对象 */

const loadTables = () => {
  // 当前bucket统计对象
  void store.addBucketStatTable(currentService.value?.endpoint_url, props.bucketName)

  // 当前bucket token对象
  void store.addBucketTokenTable(currentService.value?.endpoint_url, props.bucketName)

  // 当前path对象
  void store.addPathTable({
    serviceId: props.serviceId,
    bucket: props.bucketName,
    path: route.query.path as string
  })
}

// setup时调用一次
if (currentService.value?.endpoint_url) {
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
/* 获取相关table对象 */
const path = route.query.path as string
const currentPath = computed(() => store.tables.pathTable.byLocalId[props.serviceId + '/' + props.bucketName + (path ? ('/' + path) : '')])

const formatSize = useFormatSize(1024)
</script>

<template>
  <div class="BucketDetail">

    <div class="row items-center" style="vertical-align: bottom;">
      <div class="col-auto text-h5 text-weight-bold cursor-pointer"
           @click="navigateToUrl('/my/storage/service/' + props.serviceId + '/bucket/' + props.bucketName + '/object')">
        {{ currentBucket?.name }}
        <q-tooltip> {{ tc('进入存储桶根目录') }}</q-tooltip>
      </div>
      <div class="col-auto q-px-md text-caption">{{ currentBucket?.remarks }}</div>
    </div>

    <q-tabs
      :model-value="tab"
      active-color="primary"
      align="left"
      no-caps
      inline-label
    >
      <q-tab name="object"
             @click="navigateToUrl('/my/storage/service/' + props.serviceId + '/bucket/' + props.bucketName + '/object')">
        对象列表
      </q-tab>
      <q-tab name="property"
             @click="navigateToUrl('/my/storage/service/' + props.serviceId + '/bucket/' + props.bucketName + '/property')">
        存储桶属性
      </q-tab>
      <q-tab name="connection"
             @click="navigateToUrl('/my/storage/service/' + props.serviceId + '/bucket/' + props.bucketName + '/connection')">
        连接信息
      </q-tab>
    </q-tabs>

    <q-separator/>

    <q-tab-panels style="min-width: 1230px;" :model-value="tab" animated>

      <q-tab-panel
        name="object"
        class="q-py-md q-px-none"
      >

        <PathTable :pathObj="currentPath"/>

      </q-tab-panel>

      <q-tab-panel name="property" class="q-py-md q-px-none">

        <q-card class="q-mb-md" flat bordered>
          <q-item dense class="row items-center bg-grey-1">
            存储桶概述
          </q-item>

          <q-separator/>

          <q-card-section class="row item-center" horizontal>
            <q-card-section class="col-3">
              <div class="column">
                <div class="col text-grey">
                  名称
                </div>
                <div class="col">
                  {{ currentBucket?.name }}
                </div>
              </div>

            </q-card-section>

            <!--            <q-separator vertical/>-->

            <q-card-section class="col-3">
              <div class="col text-grey">
                所属服务单元
              </div>
              <div class="col">
                {{ i18n.global.locale === 'zh' ? currentService?.name : currentService?.name_en }}
              </div>
            </q-card-section>

            <!--            <q-separator vertical/>-->

            <q-card-section class="col-3">
              <div class="col text-grey">
                创建时间
              </div>
              <div class="col">
                {{ new Date(currentBucket?.created_time).toLocaleString(i18n.global.locale) }}
              </div>
            </q-card-section>

            <!--            <q-separator vertical/>-->

            <q-card-section class="col-3">
              <div class="col text-grey">
                备注
              </div>
              <div class="col">
                {{ currentBucket?.remarks }}
              </div>
            </q-card-section>

          </q-card-section>
        </q-card>

        <q-card flat bordered>
          <q-item dense class="row items-center bg-grey-1">
            存储桶统计信息
          </q-item>

          <q-separator/>

          <q-card-section class="row item-center" horizontal>
            <q-card-section class="col-3">
              <div class="column">
                <div class="col text-grey">
                  存储桶体积
                </div>
                <div class="col">
                  {{ formatSize(currentBucketStat?.stats.space || 0) }}
                </div>
              </div>

            </q-card-section>

            <!--            <q-separator vertical/>-->

            <q-card-section class="col-3">
              <div class="col text-grey">
                对象数量
              </div>
              <div class="col">
                {{ currentBucketStat?.stats.count }}
              </div>
            </q-card-section>

            <!--            <q-separator vertical/>-->

            <q-card-section class="col-3">
              <div class="col text-grey">
                统计时间
              </div>
              <div class="col">
                {{ new Date(currentBucketStat?.stats_time).toLocaleString(i18n.global.locale) }}
              </div>
            </q-card-section>

            <!--            <q-separator vertical/>-->

            <!--            <q-card-section class="col-3">-->
            <!--              <div class="col text-grey">-->
            <!--                备注-->
            <!--              </div>-->
            <!--              <div class="col">-->
            <!--                {{ currentBucket?.remarks }}-->
            <!--              </div>-->
            <!--            </q-card-section>-->

          </q-card-section>
        </q-card>

      </q-tab-panel>

      <q-tab-panel name="connection" class="q-py-md q-px-none">

        <q-card class="q-mb-md" flat bordered>
          <q-item dense class="row items-center bg-grey-1">
            Web 访问
          </q-item>

          <q-separator/>

          <q-card-section class="row item-center" horizontal>
            <q-card-section class="col-3">
              <div class="column">
                <div class="col text-grey">
                  Web 访问权限
                </div>
                <div class="col">
                  {{ currentBucket?.access_permission }}
                </div>
              </div>

            </q-card-section>

            <!--            <q-separator vertical/>-->

          </q-card-section>
        </q-card>

        <q-card class="q-mb-md" flat bordered>
          <q-item dense class="row items-center bg-grey-1">
            API 连接
          </q-item>

          <q-separator/>

          <q-card-section class="row item-center" horizontal>
            <q-card-section class="col-3">
              <div class="column">
                <div class="col text-grey">
                  存储桶token
                </div>
                <div class="col">
                  {{ currentBucketToken?.tokens }}
                </div>
              </div>

            </q-card-section>

            <!--            <q-separator vertical/>-->

          </q-card-section>
        </q-card>

        <q-card class="q-mb-md" flat bordered>
          <q-item dense class="row items-center bg-grey-1">
            FTP 连接
          </q-item>

          <q-separator/>

          <q-card-section class="row item-center" horizontal>
            <q-card-section class="col-3">
              <div class="column">
                <div class="col text-grey">
                  FTP 状态
                </div>
                <div class="col">
                  {{ currentBucket?.ftp_enable }}
                </div>
              </div>

            </q-card-section>

            <!--            <q-separator vertical/>-->

            <q-card-section class="col-3">
              <div class="column">
                <div class="col text-grey">
                  FTP 只读密码
                </div>
                <div class="col">
                  {{ currentBucket?.ftp_password }}
                </div>
              </div>

            </q-card-section>

            <!--            <q-separator vertical/>-->

            <q-card-section class="col-3">
              <div class="column">
                <div class="col text-grey">
                  FTP 读写密码
                </div>
                <div class="col">
                  {{ currentBucket?.ftp_ro_password }}
                </div>
              </div>

            </q-card-section>

            <!--            <q-separator vertical/>-->

          </q-card-section>
        </q-card>

      </q-tab-panel>

    </q-tab-panels>

  </div>
</template>

<style lang="scss" scoped>
.BucketDetail {
}
</style>