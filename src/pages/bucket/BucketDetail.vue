<script setup lang="ts">
import { /* ref, */ computed, watch } from 'vue'
import { navigateToUrl } from 'single-spa'
import { useStore } from 'stores/store'
import { useRoute/* , useRouter */ } from 'vue-router'
import { i18n } from 'boot/i18n'

import TokenDetail from 'components/bucket/TokenDetail.vue'
import PasswordToggle from 'components/ui/PasswordToggle.vue'
import AccessStatus from 'components/ui/AccessStatus.vue'
import PathTable from 'components/bucket/PathTable.vue'

import useFormatSize from 'src/hooks/useFormatSize'
import useCopyToClipboard from 'src/hooks/useCopyToClipboard'

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
const currentBucket = computed(() => store.tables.bucketTable.byLocalId[props.serviceId + '/' + props.bucketName])
const currentBucketStat = computed(() => store.tables.bucketStatTable.byLocalId[props.serviceId + '/' + props.bucketName])
const currentBucketTokenSet = computed(() => store.tables.bucketTokenTable.byLocalId[props.serviceId + '/' + props.bucketName])

/* 获取相关table对象 */

const loadTables = () => {
  // 当前bucket统计对象
  void store.addBucketStatTable(currentService.value?.id, props.bucketName)

  // 当前bucket token对象
  void store.addBucketTokenTable(currentService.value?.id, props.bucketName)

  // 当前path对象
  void store.addPathTable(
    props.serviceId,
    props.bucketName,
    route.query.path as string
  )
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
const clickToCopy = useCopyToClipboard()
</script>

<template>
  <div class="BucketDetail">

    <div class="row items-center" style="vertical-align: bottom;">

      <q-icon name="mdi-database" color="primary" size="md"/>

      <div class="col-auto text-h5 text-weight-bold cursor-pointer"
           @click="navigateToUrl('/my/storage/service/' + props.serviceId + '/bucket/' + props.bucketName + '/object')">
        {{ currentBucket?.name }}
        <q-tooltip> {{ tc('进入存储桶根目录') }}</q-tooltip>
      </div>

      <AccessStatus class="col-auto" :is-private="currentBucket?.access_permission === '私有'"/>

    </div>

    <div class="row">
      <div class="col-auto text-caption">{{ currentBucket?.remarks }}</div>
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

    <q-tab-panels :model-value="tab" animated>

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
                <div class="col row items-center">
                  <q-toggle
                    :model-value="currentBucket?.access_permission === '公有'"
                    :icon="currentBucket?.access_permission === '私有' ? 'mdi-lock' : 'mdi-lock-open-variant'"
                    :color="currentBucket?.access_permission === '私有' ? 'primary' : 'green'"
                    keep-color
                    @click="store.toggleBucketAccess(props.serviceId, props.bucketName)"
                  />
                  <div>{{ currentBucket?.access_permission }}</div>
                </div>
              </div>

            </q-card-section>

            <!--            <q-separator vertical/>-->

            <q-card-section class="col-auto">
              <div class="column">
                <div class="col text-grey">
                  Web 访问地址
                </div>
                <div class="col row items-center">
                  {{ $route.fullPath }}
                  <q-btn class="col-auto q-px-xs"
                         flat
                         color="primary"
                         icon="content_copy"
                         size="sm"
                         @click="clickToCopy($route.fullPath, false)">
                    <q-tooltip>
                      {{ tc('复制') }}
                    </q-tooltip>
                  </q-btn>
                </div>
              </div>
            </q-card-section>

          </q-card-section>
        </q-card>

        <q-card class="q-mb-md" flat bordered>
          <q-item dense class="row items-center bg-grey-1">
            API 连接
          </q-item>

          <q-separator/>

          <q-card-section class="row item-center" horizontal>
            <q-card-section class="col">
              <div class="column">
                <div class="col text-grey">
                  存储桶token
                </div>
                <div v-if="currentBucketTokenSet?.tokens.length === 0" class="col row items-start">
                  {{ tc('暂无可用token') }}
                </div>
                <div v-else class="col column">
                  <TokenDetail class="col-auto q-pb-sm" v-for="(token, index) in currentBucketTokenSet?.tokens"
                               :key="token.key"
                               :token="token"
                               :index="index"
                               :service-id="serviceId"
                               :bucket-name="bucketName"/>
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
                <div class="col row items-center">
                  <q-toggle
                    :model-value="currentBucket?.ftp_enable"
                    :icon="currentBucket?.ftp_enable ? 'check' : 'close'"
                    color="green"
                    @click="store.toggleBucketFtp(props.serviceId, props.bucketName)"
                  />
                  {{ currentBucket?.ftp_enable ? '开启' : '关闭' }}
                </div>
              </div>
            </q-card-section>

            <!--            <q-separator vertical/>-->

            <q-card-section class="col-3">
              <div class="column">
                <div class="col text-grey">
                  FTP 只读密码
                </div>
                <div class="col row items-center">
                  <PasswordToggle :text="currentBucket?.ftp_ro_password"/>

                  <q-btn class="q-px-xs"
                         flat
                         color="primary"
                         icon="content_copy"
                         size="sm"
                         @click="clickToCopy(currentBucket?.ftp_ro_password, true)">
                    <q-tooltip>
                      {{ tc('复制') }}
                    </q-tooltip>
                  </q-btn>

                  <q-btn icon="edit"
                         size="sm"
                         dense
                         flat
                         color="primary"
                         @click="store.triggerEditBucketFtpPasswordDialog(props.serviceId, props.bucketName, true)">
                    <q-tooltip>
                      {{ tc('修改') }}
                    </q-tooltip>
                  </q-btn>

                </div>
              </div>

            </q-card-section>

            <!--            <q-separator vertical/>-->

            <q-card-section class="col-3">
              <div class="column">
                <div class="col text-grey">
                  FTP 读写密码
                </div>
                <div class="col row items-center">
                  <PasswordToggle :text="currentBucket?.ftp_password"/>

                  <q-btn class="q-px-xs"
                         flat
                         color="primary"
                         icon="content_copy"
                         size="sm"
                         @click="clickToCopy(currentBucket?.ftp_password, true)">
                    <q-tooltip>
                      {{ tc('复制') }}
                    </q-tooltip>
                  </q-btn>

                  <q-btn icon="edit"
                         size="sm"
                         dense
                         flat
                         color="primary"
                         @click="store.triggerEditBucketFtpPasswordDialog(props.serviceId, props.bucketName, false)">
                    <q-tooltip>
                      {{ tc('修改') }}
                    </q-tooltip>
                  </q-btn>

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
