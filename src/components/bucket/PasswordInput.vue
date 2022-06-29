<script lang="ts" setup>
import { ref } from 'vue'
import { useStore } from 'stores/store'
// import { useI18n } from 'vue-i18n'
import useCopyToClipboard from 'src/hooks/useCopyToClipboard'

const props = defineProps({
  password: {
    type: String,
    required: true
  },
  isShowBtn: {
    type: Boolean,
    required: false
  },
  editAction: {
    type: String,
    required: true
  },
  editActionParameter: {
    type: Object,
    required: true
  }
})
// const emit = defineEmits(['change', 'delete'])

const store = useStore()
// const { locale } = useI18n({ useScope: 'global' })
// code starts...
// 复制信息到剪切板
const clickToCopy = useCopyToClipboard()
const isPwd = ref(true)
</script>

<template>
  <div class="PasswordInput row justify-start"
       :style="{width:`${props.password.length * 23 }px`, maxWidth: '300px', minWidth: '32px'}">
    <!--根据内容改变长度的input. 一个字母占8像素，一个汉字占16像素.https://github.com/quasarframework/quasar/issues/1958-->
    <q-input class="ellipsis"
             :input-style="{width:`${props.password.length * (isPwd?5:8.5)}px`}"
             :model-value="props.password" readonly borderless dense
             :type="isPwd ? 'password' : 'text'">

      <template v-slot:prepend>
        <q-icon :name="isPwd ? 'visibility' : 'visibility_off'"
                @click="isPwd = !isPwd"/>
      </template>

      <template v-slot:append>

        <q-btn :class="props.isShowBtn?'':'invisible'" class="q-px-xs" flat color="primary" icon="content_copy"
               size="sm"
               @click="clickToCopy(props.password, true)">
          <q-tooltip>
            复制
          </q-tooltip>
        </q-btn>

        <q-btn :class="props.isShowBtn?'':'invisible'" icon="edit" size="sm" dense flat color="primary"
               @click="store.triggerEditBucketFtpPasswordDialog(props.editActionParameter)">
          <q-tooltip>
            修改
          </q-tooltip>
        </q-btn>

      </template>

    </q-input>
  </div>
</template>

<style lang="scss" scoped>
.PasswordInput {
}
</style>
