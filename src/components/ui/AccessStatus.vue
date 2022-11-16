<script setup lang="ts">
// import { ref, computed, PropType } from "vue"
import { navigateToUrl } from 'single-spa'
// import { useStore } from 'stores/store'
// import { useRoute, useRouter } from 'vue-router'
import { i18n } from 'boot/i18n'

const props = defineProps({
  isPrivate: {
    type: Boolean,
    required: true,
    default: true
  },
  bucketId: {
    type: String,
    required: true
  }
})
// const emits = defineEmits(['change', 'delete'])

const { tc } = i18n.global
// const store = useStore()
// const route = useRoute()
// const router = useRouter()
const goConnection = () => {
  navigateToUrl('/my/storage/bucket/' + props.bucketId + '/connection')
}
</script>

<template>
  <div @click="goConnection" class="cursor-pointer">
    <q-chip v-if="props.isPrivate" class="non-selectable" color="primary" text-color="white" size="sm" icon="mdi-lock">
      {{ tc('私有访问') }}
    </q-chip>

    <q-chip v-else class="non-selectable" color="green" text-color="white" size="sm" icon="mdi-lock-open-variant">
      {{ tc('公有访问') }}
    </q-chip>
  </div>
</template>

<style lang="scss" scoped>
</style>
