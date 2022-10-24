<script lang="ts" setup>
import { computed, PropType, ref, watch } from 'vue'
import { useStore } from 'stores/store'
import { navigateToUrl } from 'single-spa'
// import { useRoute, useRouter } from 'vue-router'
import { i18n } from 'boot/i18n'

import type { BucketInterface } from 'stores/store'

import AccessStatus from 'components/ui/AccessStatus.vue'
import FtpStatus from 'components/ui/FtpStatus.vue'
import useClipText from 'src/hooks/useClipText'
import useCopyToClipboard from 'src/hooks/useCopyToClipboard'
// import useFormatSize from 'src/hooks/useFormatSize'

const props = defineProps({
  serviceId: {
    type: String,
    required: true
  },
  buckets: {
    type: Array as PropType<BucketInterface[]>,
    required: true
  }
})
// const emit = defineEmits(['change', 'delete'])

// code starts...
const store = useStore()
const { tc } = i18n.global

const currentService = computed(() => store.tables.serviceTable.byId[props.serviceId])

// table row hover
const hoverRow = ref('')
const onMouseEnterRow = (rowName: string) => {
  hoverRow.value = rowName
}
const onMouseLeaveRow = () => {
  hoverRow.value = ''
}

const selected = ref<BucketInterface[]>([])
// when some buckets were deleted from the table, the selection should be emptied.
watch(store.tables.bucketTable, () => {
  selected.value = []
})

const clipText80 = useClipText(80)
const clipText20 = useClipText(20)
// const formatSize = useFormatSize(1024)
const clickToCopy = useCopyToClipboard()
// const toggleExpansion = (props: { expand: boolean, row: { name: string } }) => {
//   if (props.expand) {
//     props.expand = !props.expand
//   } else {
//     props.expand = !props.expand
//     // 更新桶统计信息
//     // void store.addBucketStatTable({ bucket: props.row.name })
//     // 更新桶token信息
//     // void store.addBucketTokenTable({ bucket: props.row.name })
//   }
// }

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

</script>

<template>
  <div class="BucketTable">

    <div class="row q-gutter-x-md">
      <q-btn class="col-auto" no-caps unelevated color="primary" :label="tc('新建存储桶')"
             @click="store.triggerCreateBucketDialog(props.serviceId)"/>
      <q-btn class="col-auto" no-caps unelevated color="primary" :label="tc('删除存储桶')"
             :disable="selected.length === 0"
             @click="store.triggerDeleteBucketDialog(props.serviceId, selected.map((bucket: BucketInterface) => bucket.name))"/>
      <!--      <q-btn class="col-auto" unelevated no-caps color="primary" :label="tc('检索对象')"-->
      <!--             @click="navigateToUrl('/my/storage/bucket/search')"/>-->
    </div>

    <div class="row">
      <div class="col">
        <q-table
          class=""
          flat
          square
          table-header-class="bg-grey-1 text-grey"
          :rows="props.buckets"
          :columns="columns"
          row-key="name"
          hide-pagination
          :pagination="{rowsPerPage: 0}"
          :loading="store.tables.bucketTable.status === 'loading'"
          :no-data-label="tc('没有存储桶')"
          selection="multiple"
          v-model:selected="selected"
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
                       @click="navigateToUrl(`/my/storage/service/${currentService?.id}/bucket/${props.row.name}`)">

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
                <FtpStatus v-if="currentService?.provide_ftp" :is-enable="props.row.ftp_enable"/>
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
                {{ clipText20(props.row.remarks) || tc('无备注') }}

                <q-btn :class="hoverRow === props.row.name ? '':'invisible'" icon="edit" size="sm" dense flat
                       color="primary"
                       @click="store.triggerEditBucketNoteDialog(props.row.id)">
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
                       @click="navigateToUrl(`/my/storage/service/${currentService?.id}/bucket/${props.row.name}`)">
                  查看详情
                </q-btn>
              </q-td>

            </q-tr>

            <!--拓展行-->
            <!--            <q-tr v-show="props.expand" :props="props" class="bg-blue-1">-->

            <!--              <q-td auto-width>-->
            <!--              </q-td>-->

            <!--              <q-td key="name" class="text-center" style="padding: 15px 0px">-->
            <!--                <q-icon name="subdirectory_arrow_right" size="sm" color="grey-7"/>-->
            <!--              </q-td>-->

            <!--              <q-td colspan="100%" style="padding: 15px 0px">-->

            <!--                <div class="column q-px-none q-pb-md">-->

            <!--                  <div class="col-auto row items-center q-gutter-md">-->
            <!--                    <div class="col-auto text-grey">-->
            <!--                      {{ tc('存储桶统计信息') }}-->
            <!--                    </div>-->
            <!--                    <q-btn class="col-auto" flat dense no-caps padding="none" color="primary" icon="delete" size="sm"-->
            <!--                           @click="store.triggerDeleteBucketDialog({bucketNames: [props.row.name]})">-->
            <!--                      {{ tc('删除存储桶') }}-->
            <!--                    </q-btn>-->
            <!--                  </div>-->

            <!--                  <div class="col-auto row items-center q-gutter-lg">-->
            <!--                    <div>{{ props.row.name }}</div>-->
            <!--                    <div class="col-auto">-->
            <!--                      {{ tc('对象数量') }}: {{ store.tables.bucketStatTable.byLocalId[props.row.name]?.stats.count }}&nbsp;{{-->
            <!--                        tc('个')-->
            <!--                      }}-->
            <!--                    </div>-->

            <!--                    <div class="col-auto">-->
            <!--                      {{ tc('存储桶体积') }}: {{-->
            <!--                        formatSize(store.tables.bucketStatTable.byLocalId[props.row.name]?.stats.space || 0)-->
            <!--                      }}-->
            <!--                    </div>-->

            <!--                    <div class="col-auto">-->
            <!--                      {{ tc('统计时间') }}: {{-->
            <!--                        new Date(store.tables.bucketStatTable.byLocalId[props.row.name]?.stats_time).toLocaleString(i18n.global.locale)-->
            <!--                      }}-->
            <!--                    </div>-->
            <!--                  </div>-->

            <!--                </div>-->

            <!--                <q-separator/>-->

            <!--                <div class="column q-px-none q-pt-md">-->

            <!--                  <div class="col-auto row items-center q-gutter-md">-->
            <!--                    <div class="col-auto text-grey">-->
            <!--                      {{ tc('存储桶') }}Token-->
            <!--                    </div>-->
            <!--&lt;!&ndash;                    <q-btn class="col-auto" flat dense no-caps padding="none" color="primary" icon="add_circle"&ndash;&gt;-->
            <!--&lt;!&ndash;                           size="sm"&ndash;&gt;-->
            <!--&lt;!&ndash;                           @click="store.triggerAddBucketTokenDialog({bucketName: props.row.name})">&ndash;&gt;-->
            <!--&lt;!&ndash;                      {{ `${tc('创建')}  Token` }}&ndash;&gt;-->
            <!--&lt;!&ndash;                    </q-btn>&ndash;&gt;-->
            <!--                  </div>-->

            <!--                  <div v-if="store.tables.bucketTokenTable.byLocalId[props.row.name]?.tokens.length === 0">-->
            <!--                    {{ `${tc('暂无可用')}  Token` }}-->
            <!--                  </div>-->

            <!--                  <div v-else>-->
            <!--                    <div-->
            <!--                      v-for="(token, index) in store.tables.bucketTokenTable.byLocalId[props.row.name]?.tokens"-->
            <!--                      :key="index" class="col-auto row items-center q-gutter-lg">-->
            <!--                      <div class="col-auto">-->
            <!--                        {{ tc('序号') }}: {{ index + 1 }}-->
            <!--                      </div>-->

            <!--                      <div class="col-auto">-->
            <!--                        token: {{ token.key }}-->
            <!--                      </div>-->

            <!--                      <div class="col-auto">-->
            <!--                        {{ tc('权限') }}: {{ token.permission === 'readwrite' ? tc('读写') : tc('只读') }}-->
            <!--                      </div>-->

            <!--                      <div class="col-auto">-->
            <!--                        {{ tc('创建时间') }}: {{ new Date(token.created).toLocaleString(i18n.global.locale) }}-->
            <!--                      </div>-->

            <!--&lt;!&ndash;                      <div class="col-auto">&ndash;&gt;-->
            <!--&lt;!&ndash;                        <q-btn class="col-auto" flat dense no-caps padding="none" color="primary" icon="remove_circle"&ndash;&gt;-->
            <!--&lt;!&ndash;                               size="sm"&ndash;&gt;-->
            <!--&lt;!&ndash;                               @click="store.triggerDeleteBucketTokenDialog({bucketName: props.row.name, token:token.key})">&ndash;&gt;-->
            <!--&lt;!&ndash;                          {{ `${tc('删除')}  Token` }}&ndash;&gt;-->
            <!--&lt;!&ndash;                        </q-btn>&ndash;&gt;-->
            <!--&lt;!&ndash;                      </div>&ndash;&gt;-->
            <!--                    </div>-->
            <!--                  </div>-->

            <!--                </div>-->

            <!--              </q-td>-->

            <!--            </q-tr>-->

          </template>
        </q-table>

        <q-separator/>

      </div>

    </div>

  </div>
</template>

<style lang="scss" scoped>
.BucketTable {
}
</style>
