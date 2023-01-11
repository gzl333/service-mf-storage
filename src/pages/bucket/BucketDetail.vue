<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { navigateToUrl } from 'single-spa'
import { useStore } from 'stores/store'
import { useRoute/* , useRouter */ } from 'vue-router'
import { i18n } from 'boot/i18n'
import { Notify } from 'quasar'
import TokenDetail from 'components/bucket/TokenDetail.vue'
import PasswordToggle from 'components/ui/PasswordToggle.vue'
import AccessStatus from 'components/ui/AccessStatus.vue'
import PathTable from 'components/bucket/PathTable.vue'
import GlobalBreadcrumbs from 'components/ui/GlobalBreadcrumbs.vue'

import useFormatSize from 'src/hooks/useFormatSize'
import useCopyToClipboard from 'src/hooks/useCopyToClipboard'

const props = defineProps({
  bucketId: {
    type: String,
    required: true,
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
if (!store.items.currentPath[2]) {
  navigateToUrl(route.path.endsWith('/') ? route.path + 'object' : route.path + '/object')
}

const currentBucket = computed(() => store.tables.bucketTable.byId[props.bucketId])
const currentService = computed(() => store.tables.serviceTable.byId[currentBucket.value?.service?.id])
const currentBucketStat = computed(() => store.tables.bucketStatTable.byId[props.bucketId])
const currentBucketTokenSet = computed(() => store.tables.bucketTokenTable.byId[props.bucketId])
// todo 待设计分享url结构后更新
const currentBucketUrl = computed(() => location.origin + `/storage/share/${currentService.value?.id}?base=${currentBucket.value?.name}`)
/* 获取相关table对象 */
const paginationTable = ref({
  page: 1,
  limit: 100,
  offset: 0
})
const jumpPage = ref<string>('')
const loadNeededTables = () => {
  // 当前bucket统计对象
  void store.addBucketStatTable(props.bucketId)

  // 当前bucket token对象
  void store.addBucketTokenTable(props.bucketId)

  // 当前path对象
  void store.addPathTable(
    currentBucket.value.id,
    route.query.path as string,
    paginationTable.value.limit,
    paginationTable.value.offset
  )
}

// setup时调用一次 已经在layout调用了
if (currentService.value?.endpoint_url) {
  void loadNeededTables()
}

// 刷新页面时，等待有效的service信息，再调用
const unwatch = watch(currentService, () => {
  if (currentService.value?.endpoint_url) {
    // serviceTable已经加载，可以发送请求
    void loadNeededTables()
    // watcher已完成任务，注销
    unwatch()
  }
})

/* 获取相关table对象 */
const path = route.query.path as string
const currentPath = computed(() => store.tables.pathTable.byLocalId[currentBucket.value?.id + (path ? ('/' + path) : '')])
const formatSize = useFormatSize(1024)
const clickToCopy = useCopyToClipboard()
const changePageSize = async () => {
  jumpPage.value = ''
  paginationTable.value.offset = 0
  void await store.addPathTable(
    currentBucket.value.id,
    route.query.path as string,
    paginationTable.value.limit,
    paginationTable.value.offset
  )
  paginationTable.value.page = 1
}
const changePagination = () => {
  jumpPage.value = ''
  paginationTable.value.offset = (paginationTable.value.page - 1) * paginationTable.value.limit
  void store.addPathTable(
    currentBucket.value.id,
    route.query.path as string,
    paginationTable.value.limit,
    paginationTable.value.offset
  )
  store.items.pathPage = paginationTable.value
}
const goToPage = async () => {
  const pageCheck = /^$|^[1-9]\d*$/
  if (jumpPage.value === '') {
    Notify.create({
      classes: 'notification-negative shadow-15',
      icon: 'las la-times-circle',
      textColor: 'negative',
      message: tc('请输入跳转的页码'),
      position: 'bottom',
      closeBtn: true,
      timeout: 5000,
      multiLine: false
    })
  } else if (pageCheck.test(jumpPage.value) && Number(jumpPage.value) <= Math.ceil(currentPath?.value?.fileCount / paginationTable.value.limit)) {
    const page = Number(jumpPage.value)
    paginationTable.value.offset = (page - 1) * paginationTable.value.limit
    void await store.addPathTable(
      currentBucket.value.id,
      route.query.path as string,
      paginationTable.value.limit,
      paginationTable.value.offset
    )
    paginationTable.value.page = page
    jumpPage.value = ''
  } else {
    Notify.create({
      classes: 'notification-negative shadow-15',
      icon: 'las la-times-circle',
      textColor: 'negative',
      message: tc('请输入正确的页码'),
      position: 'bottom',
      closeBtn: true,
      timeout: 5000,
      multiLine: false
    })
  }
}
</script>

<template>
  <div class="BucketDetail">

    <!--    <div class="row items-center text-black q-pb-md">-->
    <!--      <GlobalBreadcrumbs/>-->
    <!--    </div>-->

    <div class="row items-center" style="vertical-align: bottom;">

      <q-icon name="mdi-database" color="primary" size="md"/>

      <div class="col-auto text-h5 text-weight-bold non-selectable">
        {{ currentBucket?.name }}
      </div>

      <AccessStatus class="col-auto" :is-private="currentBucket?.detail.access_permission === '私有'"/>

    </div>

    <div class="row">
      <div class="col-auto text-caption">{{ currentBucket?.detail.remarks }}</div>
    </div>

    <q-tabs
      :model-value="tab"
      active-color="primary"
      align="left"
      no-caps
      inline-label
    >
      <q-tab name="object" icon="las la-file-alt"
             @click="navigateToUrl('/my/storage/bucket/' + props.bucketId + '/object')">
        {{ tc('对象列表') }}
      </q-tab>
      <q-tab name="property" icon="las la-cog"
             @click="navigateToUrl('/my/storage/bucket/' + props.bucketId + '/property')">
        {{ tc('存储桶属性') }}
      </q-tab>
      <q-tab name="connection" icon="las la-network-wired"
             @click="navigateToUrl('/my/storage/bucket/' + props.bucketId + '/connection')">
        {{ tc('连接信息') }}
      </q-tab>
    </q-tabs>

    <q-separator/>

    <q-tab-panels :model-value="tab" animated>

      <q-tab-panel
        name="object"
        class="q-py-md q-px-none"
      >

        <div class="row items-center justify-between text-black q-pb-md">
          <GlobalBreadcrumbs/>
        </div>
        <PathTable :pathObj="currentPath"/>
        <q-page-sticky position="top-right" :offset="[18, 20]">
          <div class="row cursor-pointer" @click="store.triggerDownloadProgressDialog()">
            <div class="bg-blue-5 q-py-xs q-px-sm">
              <q-icon color="white" name="las la-cloud-download-alt" size="sm"/>
            </div>
            <div class="row items-center bg-light-blue-3 q-py-xs q-px-sm">
              <div class="text-black">{{ tc('查看下载任务') }}</div>
              <q-badge color="orange" floating v-show="store.items.waitQueue.length + store.items.downQueue.length !== 0">
                {{ store.items.waitQueue.length + store.items.downQueue.length }}
              </q-badge>
            </div>
          </div>
<!--                    <q-btn no-caps color="purple" class="q-px-sm" :label="tc('查看下载文件')"-->
<!--                           @click="store.triggerDownloadProgressDialog()">-->
<!--                      <q-badge color="orange" floating v-show="store.items.waitQueue.length + store.items.downQueue.length !== 0">-->
<!--                        {{ store.items.waitQueue.length + store.items.downQueue.length }}-->
<!--                      </q-badge>-->
<!--                    </q-btn>-->
        </q-page-sticky>
        <div class="row q-mt-md text-grey justify-between items-center">
          <div class="row items-center">
            <div>每页文件数：</div>
            <q-select color="grey" v-model="paginationTable.limit" :options="[100, 150, 200, 250,300]" dense
                      options-dense
                      borderless @update:model-value="changePageSize">
            </q-select>
            <div>/{{ tc('页') }}</div>
          </div>
          <div class="row items-center justify-end">
            <q-form
              @submit="goToPage"
              class="q-gutter-md q-mr-md"
            >
              <div class="row items-center">
                <div class="q-mr-sm">跳转到</div>
                <q-input class="q-mr-sm" style="width: 50px" outlined dense v-model="jumpPage"/>
                <div class="q-mr-sm">页</div>
                <q-btn color="primary" label="跳转" @click="goToPage"/>
              </div>
            </q-form>
            <q-pagination
              v-model="paginationTable.page"
              :max="Math.ceil(currentPath?.fileCount/paginationTable.limit)"
              :max-pages="10"
              direction-links
              boundary-links
              icon-first="skip_previous"
              icon-last="skip_next"
              icon-prev="fast_rewind"
              icon-next="fast_forward"
              @update:model-value="changePagination"
            />
          </div>
        </div>
      </q-tab-panel>

      <q-tab-panel name="property" class="q-py-md q-px-none">

        <q-card class="q-mb-md" flat bordered>
          <q-item dense class="row items-center bg-grey-1">
            {{ tc('存储桶概述') }}
          </q-item>

          <q-separator/>

          <q-card-section class="row item-center" horizontal>
            <q-card-section class="col-3">
              <div class="column">
                <div class="col text-grey">
                  {{ tc('名称') }}
                </div>
                <div class="col">
                  {{ currentBucket?.name }}
                </div>
              </div>

            </q-card-section>

            <!--            <q-separator vertical/>-->

            <q-card-section class="col-3">
              <div class="col text-grey">
                {{ tc('所属服务单元') }}
              </div>
              <div class="col">
                {{ i18n.global.locale === 'zh' ? currentService?.name : currentService?.name_en }}
              </div>
            </q-card-section>

            <!--            <q-separator vertical/>-->

            <q-card-section class="col-3">
              <div class="column">
                <div class="col text-grey">
                  {{ tc('创建时间') }}
                </div>
                <div class="col">
                  {{ new Date(currentBucket?.detail.created_time).toLocaleString(i18n.global.locale) }}
                </div>
              </div>
            </q-card-section>

            <!--            <q-separator vertical/>-->

            <q-card-section class="col-3">
              <div class="column">
                <div class="col text-grey">
                  {{ tc('备注') }}
                </div>
                <div class="col"
                     style="max-width: 300px; word-break: break-all; word-wrap: break-word; white-space: normal;">
                  {{ currentBucket?.detail.remarks || tc('无备注') }}
                  <q-btn icon="edit"
                         dense
                         flat
                         no-caps
                         color="primary"
                         @click="store.triggerEditBucketNoteDialog(bucketId)">
                    {{ tc('修改备注') }}
                  </q-btn>
                </div>
              </div>
            </q-card-section>

          </q-card-section>
        </q-card>

        <q-card flat bordered>
          <q-item dense class="row items-center bg-grey-1">
            {{ tc('存储桶统计信息') }}
          </q-item>

          <q-separator/>

          <q-card-section class="row item-center" horizontal>
            <q-card-section class="col-3">
              <div class="column">
                <div class="col text-grey">
                  {{ tc('存储桶体积') }}
                </div>
                <div class="col">
                  {{ formatSize(currentBucketStat?.stats.space || 0) }}
                </div>
              </div>

            </q-card-section>

            <!--            <q-separator vertical/>-->

            <q-card-section class="col-3">
              <div class="column">
                <div class="col text-grey">
                  {{ tc('对象数量') }}
                </div>
                <div class="col">
                  {{ currentBucketStat?.stats.count }}
                </div>
              </div>
            </q-card-section>

            <!--            <q-separator vertical/>-->

            <q-card-section class="col-3">
              <div class="column">
                <div class="col text-grey">
                  {{ tc('统计时间') }}
                </div>
                <div class="col">
                  {{ new Date(currentBucketStat?.stats_time).toLocaleString(i18n.global.locale) }}
                </div>
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
            {{ tc('Web 访问') }}
          </q-item>

          <q-separator/>

          <q-card-section class="row item-center" horizontal>
            <q-card-section class="col-3">
              <div class="column">
                <div class="col text-grey">
                  {{ tc('Web 访问权限') }}
                </div>
                <div class="col row items-center">
                  <q-toggle
                    :model-value="currentBucket?.detail.access_permission === '公有'"
                    :icon="currentBucket?.detail.access_permission === '私有' ? 'mdi-lock' : 'mdi-lock-open-variant'"
                    :color="currentBucket?.detail.access_permission === '私有' ? 'primary' : 'green'"
                    keep-color
                    @click="store.toggleBucketAccess(bucketId)"
                  />
                  <div>{{ currentBucket?.detail.access_permission }}</div>
                </div>
              </div>

            </q-card-section>

            <!--            <q-separator vertical/>-->

            <q-card-section v-if="currentBucket?.detail.access_permission === '公有'" class="col-auto">
              <div class="column">
                <div class="col text-grey">
                  {{ tc('Web 访问地址') }}
                </div>
                <div class="col row items-center">
                  {{ currentBucketUrl }}
                  <q-btn class="col-auto q-px-xs"
                         flat
                         color="primary"
                         icon="content_copy"
                         size="sm"
                         @click="clickToCopy(currentBucketUrl, false)">
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
            {{ tc('API 连接') }}
          </q-item>

          <q-separator/>

          <q-card-section class="row item-center" horizontal>
            <q-card-section class="col">
              <div class="column">
                <div class="col text-grey row items-center">
                  <div class="col-auto q-pr-md">
                    {{ tc('存储桶token') }}
                  </div>
                  <q-btn class="col-auto" flat dense no-caps padding="none" color="primary" icon="add_circle"
                         @click="store.triggerAddBucketTokenDialog(bucketId)">
                    {{ `${tc('创建')} token` }}
                  </q-btn>
                </div>
                <div v-if="currentBucketTokenSet?.tokens.length === 0" class="col row items-start">
                  {{ tc('暂无可用token') }}
                </div>
                <div v-else class="col column">
                  <TokenDetail class="col-auto q-pb-sm" v-for="(token, index) in currentBucketTokenSet?.tokens"
                               :key="token.key"
                               :token="token"
                               :index="index"
                               :bucket-id="bucketId"/>
                </div>
              </div>

            </q-card-section>

            <!--            <q-separator vertical/>-->

          </q-card-section>
        </q-card>

        <q-card class="q-mb-md" flat bordered>
          <q-item dense class="row items-center bg-grey-1">
            {{ tc('FTP 连接') }}
          </q-item>

          <q-separator/>

          <q-card-section class="row item-center" horizontal>

            <q-card-section v-if="!currentService?.provide_ftp" class="col-3">
              {{ tc('不支持FTP连接') }}
            </q-card-section>

            <q-card-section v-if="currentService?.provide_ftp" class="col-3">
              <div class="column">
                <div class="col text-grey">
                  {{ tc('FTP 状态') }}
                </div>
                <div class="col row items-center">
                  <q-toggle
                    :model-value="currentBucket?.detail.ftp_enable"
                    :icon="currentBucket?.detail.ftp_enable ? 'check' : 'close'"
                    color="green"
                    @click="store.toggleBucketFtp(bucketId)"
                  />
                  {{ currentBucket?.detail.ftp_enable ? tc('开启') : tc('关闭') }}
                </div>
              </div>
            </q-card-section>

            <!--            <q-separator vertical/>-->

            <q-card-section v-if="currentService?.provide_ftp" class="col-3">
              <div class="column">
                <div class="col text-grey">
                  {{ tc('FTP 只读密码') }}
                </div>
                <div class="col row items-center">
                  <PasswordToggle :text="currentBucket?.detail.ftp_ro_password"/>

                  <q-btn class="q-px-xs"
                         flat
                         color="primary"
                         icon="content_copy"
                         size="sm"
                         @click="clickToCopy(currentBucket?.detail.ftp_ro_password, true)">
                    <q-tooltip>
                      {{ tc('复制') }}
                    </q-tooltip>
                  </q-btn>

                  <q-btn icon="edit"
                         size="sm"
                         dense
                         flat
                         color="primary"
                         @click="store.triggerEditBucketFtpPasswordDialog(bucketId, true)">
                    <q-tooltip>
                      {{ tc('修改') }}
                    </q-tooltip>
                  </q-btn>

                </div>
              </div>

            </q-card-section>

            <!--            <q-separator vertical/>-->

            <q-card-section v-if="currentService?.provide_ftp" class="col-3">
              <div class="column">
                <div class="col text-grey">
                  {{ tc('FTP 读写密码') }}
                </div>
                <div class="col row items-center">
                  <PasswordToggle :text="currentBucket?.detail.ftp_password"/>

                  <q-btn class="q-px-xs"
                         flat
                         color="primary"
                         icon="content_copy"
                         size="sm"
                         @click="clickToCopy(currentBucket?.detail.ftp_password, true)">
                    <q-tooltip>
                      {{ tc('复制') }}
                    </q-tooltip>
                  </q-btn>

                  <q-btn icon="edit"
                         size="sm"
                         dense
                         flat
                         color="primary"
                         @click="store.triggerEditBucketFtpPasswordDialog(bucketId, false)">
                    <q-tooltip>
                      {{ tc('修改') }}
                    </q-tooltip>
                  </q-btn>

                </div>
              </div>

            </q-card-section>

            <q-card-section v-if="currentService?.provide_ftp" class="col-3">
              <div class="column">
                <div class="col text-grey">
                  {{ tc('FTP连接地址') }}
                </div>
                <div v-for="domain in currentService.ftp_domains" :key="domain" class="col row items-center"
                     style="max-width: 300px; word-break: break-all; word-wrap: break-word; white-space: normal;">
                  <div class="col-shrink">{{ domain }}</div>
                  <div class="col-shrink">
                    <q-btn class="q-px-xs"
                           flat
                           color="primary"
                           icon="content_copy"
                           size="sm"
                           @click="clickToCopy(domain, false)">
                      <q-tooltip>
                        {{ tc('复制') }}
                      </q-tooltip>
                    </q-btn>
                  </div>

                </div>
              </div>
            </q-card-section>

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
