<script setup lang="ts">
import { /* ref, computed, */ PropType } from 'vue'
// import { navigateToUrl } from 'single-spa'
import { BucketTokenInterface/* , useStore */ } from 'stores/store'
// import { useRoute, useRouter } from 'vue-router'
// import { i18n } from 'boot/i18n'

/* const props =  */defineProps({
  token: {
    type: Object as PropType<BucketTokenInterface>,
    required: true
  }
})
// const emits = defineEmits(['change', 'delete'])

// const { tc } = i18n.global
// const store = useStore()
// const route = useRoute()
// const router = useRouter()

</script>

<template>
  <div class="TokenDetail">
    {{ token }}
  </div>
</template>

<style lang="scss" scoped>
.TokenDetail {
}
</style>
