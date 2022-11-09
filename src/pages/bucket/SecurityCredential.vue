<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useStore } from 'stores/store'
// import { useRoute, useRouter } from 'vue-router'
import { i18n } from 'boot/i18n'
import { Notify } from 'quasar'
import PasswordToggle from 'components/ui/PasswordToggle.vue'
// const props = defineProps({
//   foo: {
//     type: String as PropType<'bar'>,
//     required: false,
//     default: ''
//   }
// })
// const emits = defineEmits(['change', 'delete'])

const store = useStore()
const { tc } = i18n.global
const serviceOptions = computed(() => store.getServiceOptions)
// const firstServiceOptions = computed(() => store.tables.serviceTable.allIds)
const defaultServiceOption = ref()
const chooseTabDataCenter = () => {
  defaultServiceOption.value = serviceOptions.value[0]
}
// const route = useRoute()
// const router = useRouter()
const tokenExpanded = ref(true)
const keyExpanded = ref(true)
const tokenRow = computed(() => store.getTokenTable(defaultServiceOption.value?.serviceId))
const keysRow = computed(() => store.getKeyPairTable(defaultServiceOption.value?.serviceId))
const tokenColumns = computed(() => [
  {
    name: 'createTime',
    label: (() => tc('创建时间'))(),
    field: 'createTime',
    align: 'left'
  },
  {
    name: 'token',
    label: (() => tc('Token'))(),
    field: 'token',
    align: 'left',
    style: 'width: 700px'
  },
  {
    name: 'operation',
    label: (() => tc('操作'))(),
    field: 'operation',
    align: 'left'
  }
])
const keyColumns = computed(() => [
  {
    name: 'create_time',
    label: (() => tc('创建时间'))(),
    field: 'createTime',
    align: 'left'
  },
  {
    name: 'access_key',
    label: (() => tc('访问密钥(access_key)'))(),
    field: 'token',
    align: 'left'
  },
  {
    name: 'secret_key',
    label: (() => tc('秘密密钥(secret_key)'))(),
    field: 'token',
    align: 'left',
    style: 'width: 450px'
  },
  {
    name: 'state',
    label: (() => tc('状态'))(),
    field: 'token',
    align: 'left'
  },
  {
    name: 'operation',
    label: (() => tc('操作'))(),
    field: 'operation',
    align: 'left'
  }
])
chooseTabDataCenter()
const addKey = () => {
  if (keysRow.value.length < 2) {
    store.triggerCreateKeyDialog(defaultServiceOption.value.serviceId)
  } else {
    Notify.create({
      classes: 'notification-negative shadow-15',
      icon: 'las la-times-circle',
      textColor: 'negative',
      message: `${tc('最多只能创建2个访问密匙')}`,
      position: 'bottom',
      // closeBtn: true,
      timeout: 5000,
      multiLine: true
    })
  }
}
watch(serviceOptions, chooseTabDataCenter)
</script>

<template>
  <div class="SecurityCredential">
    <div class="row justify-between items-center">
      <div>
        <span class="text-h6 text-primary text-weight-bold">{{ defaultServiceOption?.label }}</span>
        <span class="text-h6">的安全凭证</span>
        <div>使用此页面管理 iHarbor 账户安全凭证。</div>
      </div>
      <q-select class="col-2" outlined dense v-model="defaultServiceOption" :options="serviceOptions" label="筛选服务单元"/>
    </div>
    <q-separator class="q-mt-md"/>
    <div class="q-mt-md">
      <q-list bordered>
        <q-expansion-item
          v-model="tokenExpanded"
          icon="perm_identity"
          label="身份认证token"
        >
          <q-separator/>
          <q-card>
            <q-card-section>
              token密钥用于身份验证，token应包含在Authorization HTTP标头中，密钥应以字符串文字“Token”为前缀，空格分隔两个字符串。
            </q-card-section>
            <q-card-section class="text-primary">
              例如：Authorization: Token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b
            </q-card-section>
            <q-card-section>
              刷新创建新token，旧token会失效，如果token泄露，请及时创建新的token，以防数据泄露丢失。
            </q-card-section>
            <q-card-section>
              <q-table
                class="rounded-borders"
                flat
                square
                table-header-class="bg-grey-1 text-grey"
                :rows="tokenRow"
                :columns="tokenColumns"
                hide-pagination
                :no-data-label="tc('没有文件')"
              >
                <template v-slot:body="props">
                  <q-tr :props="props" :class="props.expand ? 'bg-blue-1':''">

                    <q-td key="createTime" :props="props">
                      {{ new Date(props.row.created).toLocaleString(i18n.global.locale) }}
                    </q-td>

                    <q-td key="token" :props="props">
                      <PasswordToggle style="max-width: 350px; min-width: 32px;" :text="props.row.key"/>
                    </q-td>

                    <q-td key="operation" :props="props">
                      <q-btn color="primary" unelevated no-caps @click="store.triggerCreateTokenDialog(defaultServiceOption.serviceId)">
                        {{ tc('创建新Token') }}
                      </q-btn>
                    </q-td>
                  </q-tr>
                </template>
              </q-table>
            </q-card-section>
          </q-card>
        </q-expansion-item>
      </q-list>
    </div>
    <q-separator class="q-mt-md"/>
    <div class="q-mt-md">
      <q-list bordered>
        <q-expansion-item
          v-model="keyExpanded"
          icon="las la-key"
          label="访问密钥对"
        >
          <q-separator/>
          <q-card>
            <q-card-section>
              每个访问密钥包含access_key和secret_key密钥对，访问密钥不只是简单的身份认证，每次http请求前都需要根据请求的url的path和有效期时间戳重新计算auth_key字符串，此认证方式安全性高，使用稍微复杂一些(具体生成过程请参考帮助文档)。
              auth_key的格式为“evhb-auth {access_key}:{hmac_sha1}:{data_base64}”，应包含在Authorization
              HTTP标头中，密钥应以字符串文字“evhb-auth”为前缀，空格分隔两个字符串。
            </q-card-section>
            <q-card-section class="text-primary">
              例如：Authorization: evhb-auth xxx:xxx:xxx
            </q-card-section>
            <q-card-section>
              <q-btn class="q-ma-sm" color="primary" no-caps unelevated @click="addKey">{{
                  tc('创建新访问密匙')
                }}
              </q-btn>
              <q-table
                class="rounded-borders"
                flat
                square
                table-header-class="bg-grey-1 text-grey"
                :rows="keysRow"
                :columns="keyColumns"
                hide-pagination
                :no-data-label="tc('没有文件')"
              >
                <template v-slot:body="props">
                  <q-tr :props="props" :class="props.expand ? 'bg-blue-1':''">

                    <q-td key="create_time" :props="props">
                      {{ new Date(props.row.create_time).toLocaleString(i18n.global.locale) }}
                    </q-td>

                    <q-td key="access_key" :props="props">
                      {{ props.row.access_key }}
                    </q-td>

                    <q-td key="secret_key" :props="props">
                      <PasswordToggle style="max-width: 350px; min-width: 32px;" :text="props.row.secret_key"/>
                    </q-td>

                    <q-td key="state" :props="props">
                      <div :class="props.row.state ? 'text-green' : 'text-orange'">
                        {{ props.row.state ? '使用中' : '已停用' }}
                      </div>
                    </q-td>

                    <q-td key="operation" :props="props">
                      <q-btn color="primary" unelevated no-caps
                             @click="store.triggerChangeKeyStateDialog(defaultServiceOption.serviceId, props.row.access_key, props.row.state)">
                        {{ props.row.state ? tc('停用') : tc('启用') }}
                      </q-btn>
                      <q-btn class="q-ml-xs" color="primary" unelevated no-caps
                             @click="store.triggerDeleteKeyDialog(defaultServiceOption.serviceId, props.row.access_key)">
                        {{ tc('删除') }}
                      </q-btn>
                    </q-td>
                  </q-tr>
                </template>
              </q-table>
            </q-card-section>
          </q-card>
        </q-expansion-item>
      </q-list>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.SecurityCredential {
}
</style>