<script setup lang="ts">
import { ref, computed, PropType, onMounted, watch } from 'vue'
import { navigateToUrl } from 'single-spa'
import { BucketInterface, useStore } from 'stores/store'
// import { useRoute, useRouter } from 'vue-router'
import { i18n } from 'boot/i18n'

import useClipText from 'src/hooks/useClipText'
import useFormatSize from 'src/hooks/useFormatSize'
import useCopyToClipboard from 'src/hooks/useCopyToClipboard'

// const props = defineProps({
//   foo: {
//     type: String as PropType<'bar'>,
//     required: false,
//     default: ''
//   }
// })
// const emits = defineEmits(['change', 'delete'])

const { tc } = i18n.global
const store = useStore()
// const route = useRoute()
// const router = useRouter()

// 服务单元筛选
const serviceSelection = ref('all')
const serviceOptions = computed(() => store.getServiceOptions)

// 存储桶选择集合
const bucketSelection = ref<BucketInterface[]>([])

const buckets = computed(() => Object.values(store.tables.bucketTable.byLocalId))

// table row hover
const hoverRow = ref('')
const onMouseEnterRow = (rowName: string) => {
  hoverRow.value = rowName
}
const onMouseLeaveRow = () => {
  hoverRow.value = ''
}

const clipText80 = useClipText(80)
const clipText20 = useClipText(20)
const formatSize = useFormatSize(1024)
const clickToCopy = useCopyToClipboard()

const columns = computed(() => [
  {
    name: 'name',
    label: (() => tc('存储桶'))(),
    field: 'name',
    align: 'left',
    headerStyle: 'padding: 0 0 0 1px',
    style: 'max-width: 1200px;padding: 15px 0px',
    classes: ''
  },
  {
    name: 'creation',
    label: (() => tc('创建时间'))(),
    field: 'creation',
    align: 'left',
    headerStyle: 'padding: 0 0 0 1px',
    style: 'padding: 15px 0px',
    classes: ''
  },
  {
    name: 'access',
    label: (() => tc('访问权限'))(),
    field: 'access',
    align: 'left',
    headerStyle: 'padding: 0 0 0 1px',
    style: 'padding: 15px 0px',
    classes: ''
  },
  {
    name: 'ftp',
    label: (() => tc('FTP状态'))(),
    field: 'ftp',
    align: 'left',
    headerStyle: 'padding: 0 0 0 1px',
    style: 'padding: 15px 0px',
    classes: ''
  },
  // {
  //   name: 'write',
  //   label: (() => tc('读写密码'))(),
  //   field: 'write',
  //   align: 'left',
  //   headerStyle: 'padding: 0 0 0 1px',
  //   style: 'padding: 15px 0px; max-width: 200px;',
  //   classes: ''
  // },
  // {
  //   name: 'read',
  //   label: (() => tc('只读密码'))(),
  //   field: 'read',
  //   align: 'left',
  //   headerStyle: 'padding: 0 0 0 1px',
  //   style: 'padding: 15px 0px; max-width: 200px;',
  //   classes: ''
  // },
  {
    name: 'note',
    label: (() => tc('备注'))(),
    field: 'note',
    align: 'left',
    headerStyle: 'padding: 0 0 0 1px',
    style: 'padding: 15px 0px',
    classes: ''
  },
  {
    name: 'operation',
    label: (() => tc('操作'))(),
    field: 'operation',
    align: 'left',
    headerStyle: 'padding: 0 0 0 1px',
    style: 'padding: 15px 0px; width: 150px;',
    classes: ''
  }
])

// 根据当前分页条件loadBucketTable
const loadBucketTable = () => {
  store.loadBucketTable(1, 999)
}

/* load bucket table */
// setup时调用一次
if (store.tables.serviceTable.status === 'total') {
  loadBucketTable()
}
// 刷新页面时，等待有效的service信息，再调用
const unwatch = watch(store.tables.serviceTable, () => {
  if (store.tables.serviceTable.status === 'total') {
    // serviceTable已经加载，可以load bucketTable
    loadBucketTable()
    // watcher已完成任务，注销
    unwatch()
  }
})
/* load bucket table */

</script>

<template>
  <div class="AllBucketList">

    <div class="row items-center justify-between">

      <div class="col-auto row items-center q-gutter-x-md">
        <q-btn class="col-auto" no-caps unelevated color="primary" :label="tc('新建存储桶')"/>
        <q-btn class="col-auto" no-caps unelevated color="primary" :label="tc('删除存储桶')"
               :disable="bucketSelection.length === 0"/>
      </div>

      <div class="col-3 row items-center justify-end">
        <q-select
          class="col"
          outlined
          dense
          stack-label
          :label="tc('筛选服务单元')"
          v-model="serviceSelection"
          :options="serviceOptions"
          emit-value
          map-options
          option-value="value"
          :option-label="i18n.global.locale ==='zh'? 'label':'labelEn'">
          <!--当前选项的内容插槽-->
          <template v-slot:selected-item="scope">
                <span :class="serviceSelection===scope.opt.value ? 'text-primary' : 'text-black'">
                  {{ i18n.global.locale === 'zh' ? scope.opt.label : scope.opt.labelEn }}
                </span>
          </template>
        </q-select>
      </div>

    </div>

    <pre>
      {{ buckets }}
    </pre>

    <div class="row">
      <q-table
        class=""
        flat
        square
        table-header-class="bg-grey-1 text-grey"
        :rows="buckets"
        :columns="columns"
        row-key="name"
        hide-pagination
        :pagination="{rowsPerPage: 0}"
        :loading="store.tables.bucketTable.status === 'loading'"
        :no-data-label="tc('没有存储桶')"
        selection="multiple"
        v-model:selected="bucketSelection"
      >

        <template v-slot:header-selection="scope">
          <q-checkbox v-model="scope.selected" dense size="xs"/>
        </template>

        <template v-slot:body="props">
          <q-tr :props="props" :class="props.expand ? 'bg-blue-1':''"
                @mouseenter="onMouseEnterRow(props.row.name)"
                @mouseleave="onMouseLeaveRow">

            <q-td auto-width>
              <q-checkbox v-model="props.selected" dense size="xs"/>
            </q-td>

            <q-td key="name" :props="props">

              <q-btn flat padding="none" no-caps
                     @click="navigateToUrl(`/my/storage/service/${props.row.service.id}/bucket/${props.row.name}`)">

                <div class="row items-center no-wrap">
                  <q-icon class="col-auto" size="sm" color="primary" name="mdi-database"/>
                  <div class="col-auto"> {{ clipText80(props.row.name) }}</div>
                </div>

                <!--创建时间距离当下小于1小时则打上new标记-->
                <q-badge style="top:-10px;"
                         v-if="(new Date() - new Date(props.row.created_time)) < 1000 * 60 * 60 * 1 "
                         color="light-green" floating transparent rounded align="middle">
                  new
                </q-badge>

              </q-btn>

              <q-btn v-if="hoverRow === props.row.name" class="col-shrink q-px-xs q-ma-none" flat dense
                     icon="content_copy" size="xs" color="primary"
                     @click="clickToCopy(props.row.name)">
                <q-tooltip>
                  {{ tc('复制到剪切板') }}
                </q-tooltip>
              </q-btn>
              <q-btn v-else
                     class="col-shrink q-px-xs q-ma-none invisible" flat dense icon="content_copy" size="xs">
              </q-btn>

            </q-td>

            <q-td key="creation" :props="props">
              {{ new Date(props.row.created_time).toLocaleString(i18n.global.locale) }}
            </q-td>

            <q-td key="access" :props="props">
              <!--                <q-toggle-->
              <!--                  :model-value="props.row.access_permission === '私有'"-->
              <!--                  icon="lock"-->
              <!--                  color="primary"-->
              <!--                  keep-color-->
              <!--                  @click="store.toggleBucketAccess({bucketName: props.row.name})"-->
              <!--                />-->
              <AccessStatus :is-private="props.row.access_permission === '私有'"/>
            </q-td>

            <q-td key="ftp" :props="props">
              <FtpStatus v-if="store.tables.serviceTable.byId[props.row.service.id]?.provide_ftp"
                         :is-enable="props.row.ftp_enable"/>
              <div v-else>本服务单元不支持FTP连接</div>
            </q-td>

            <!--              <q-td key="write" :props="props">-->
            <!--                <PasswordInput :password="props.row.ftp_password" :is-show-btn="hoverRow === props.row.name"-->
            <!--                               :edit-action="'triggerEditBucketFtpPasswordDialog'"-->
            <!--                               :edit-action-parameter="{bucketName: props.row.name, isRo: false}"/>-->
            <!--              </q-td>-->

            <!--              <q-td key="read" :props="props">-->
            <!--                <PasswordInput :password="props.row.ftp_ro_password" :is-show-btn="hoverRow === props.row.name"-->
            <!--                               :edit-action="'triggerEditBucketFtpPasswordDialog'"-->
            <!--                               :edit-action-parameter="{bucketName: props.row.name, isRo: true}"/>-->
            <!--              </q-td>-->

            <q-td key="note" :props="props">
              {{ clipText20(props.row.detail.remarks) || tc('无备注') }}

              <q-btn :class="hoverRow === props.row.name ? '':'invisible'" icon="edit" size="sm" dense flat
                     color="primary"
                     @click="store.triggerEditBucketNoteDialog(props.row.service.id, props.row.name)">
                <q-tooltip>
                  {{ tc('修改') }}
                </q-tooltip>
              </q-btn>

            </q-td>

            <q-td key="operation" :props="props">
              <!--                <div class="column q-gutter-y-xs" style="width: 127px;">-->
              <!--                  <q-btn unelevated dense color="primary" no-caps @click="toggleExpansion(props)"-->
              <!--                         :icon="props.expand ? 'expand_less' : 'expand_more'">-->
              <!--                    <div v-if="props.expand">{{ tc('折叠详情') }}</div>-->
              <!--                    <div v-else>{{ tc('展开详情') }}</div>-->
              <!--                  </q-btn>-->
              <!--                </div>-->

              <q-btn unelevated dense color="primary" no-caps
                     @click="navigateToUrl(`/my/storage/service/${props.row.service.id}/bucket/${props.row.name}`)">
                查看详情
              </q-btn>
            </q-td>

          </q-tr>

        </template>
      </q-table>

      <q-separator/>

    </div>

  </div>
</template>

<style lang="scss" scoped>
.AllBucketList {
}
</style>
