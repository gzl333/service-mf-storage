<script setup lang="ts">
import { ref, /*  computed, */ PropType } from 'vue'
// import { navigateToUrl } from 'single-spa'
import { BucketTokenInterface, useStore } from 'stores/store'
// import { useRoute, useRouter } from 'vue-router'
import { i18n } from 'boot/i18n'

import useCopyToClipboard from 'src/hooks/useCopyToClipboard'

/* const props =  */
defineProps({
  bucketId: {
    type: String,
    required: true,
    default: ''
  },
  token: {
    type: Object as PropType<BucketTokenInterface>,
    required: true
  },
  index: {
    type: Number,
    required: true
  }
})
// const emits = defineEmits(['change', 'delete'])

const { tc } = i18n.global
const store = useStore()
// const route = useRoute()
// const router = useRouter()

const expanded = ref(false)
const clickToCopy = useCopyToClipboard()
</script>

<template>
  <div class="TokenDetail" style="width: 380px;">
    <q-card flat bordered>

      <q-item class="row items-center justify-between text-white"
              :class="token.permission === 'readonly' ? 'bg-primary' : 'bg-green'"
              dense
      >
        <div class="col-auto row items-center">
          <div> {{ index + 1 }}</div>
          -
          <div> {{ token.permission === 'readonly' ? tc('只读token') : tc('读写token') }}</div>
        </div>

        <q-btn
          class="col-auto"
          color="white"
          size="md"
          :ripple="false"
          flat
          dense
          no-caps
          :icon="expanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
          @click="expanded = !expanded"
        >
          {{ expanded ? tc('收起详情') : tc('展开详情') }}
        </q-btn>

      </q-item>

      <q-slide-transition>
        <div v-show="expanded" class="bg-grey-1">

          <q-card-section>

            <div class="row items-center ">
              <div class="col column">
                <div class="col text-grey">
                  Key
                </div>
                <div class="col row items-center">
                  <div class="col-auto">
                    {{ token.key }}
                  </div>
                  <q-btn class="col-auto q-px-xs"
                         flat
                         color="primary"
                         icon="content_copy"
                         size="sm"
                         @click="clickToCopy(token.key, false)">
                    <q-tooltip>
                      {{ tc('复制') }}
                    </q-tooltip>
                  </q-btn>
                </div>
              </div>
            </div>

            <div class="row items-center ">
              <div class="col column">
                <div class="col text-grey">
                  创建时间
                </div>
                <div class="col row items-center">
                  <div class="col-auto">
                    {{ new Date(token.created).toLocaleString(i18n.global.locale) }}
                  </div>
                  <q-btn flat padding="none" color="primary" icon="cancel" no-caps
                         @click="store.triggerDeleteBucketTokenDialog(bucketId, token.key)">
                    {{ tc('删除token') }}
                  </q-btn>
                </div>
              </div>
            </div>

          </q-card-section>
        </div>
      </q-slide-transition>
    </q-card>
  </div>
</template>

<style lang="scss" scoped>
.TokenDetail {
}
</style>
