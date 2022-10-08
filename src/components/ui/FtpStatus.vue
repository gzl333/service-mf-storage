<script setup lang="ts">
// import { ref, computed, PropType } from "vue"
// import { navigateToUrl } from 'single-spa'
// import { useStore } from 'stores/store'
// import { useRoute, useRouter } from 'vue-router'
// import { i18n } from 'boot/i18n'

/* const props =  */defineProps({
  isEnable: {
    type: Boolean,
    required: true,
    default: false
  }
})
// const emits = defineEmits(['change', 'delete'])

// const { tc } = i18n.global
// const store = useStore()
// const route = useRoute()
// const router = useRouter()

</script>

<template>
  <q-chip v-if="isEnable" color="green" text-color="white" size="sm" icon="check">
    FTP开启
  </q-chip>

  <q-chip v-else color="grey" text-color="white" size="sm" icon="close">
    FTP关闭
  </q-chip>
</template>

<style lang="scss" scoped>
</style>
