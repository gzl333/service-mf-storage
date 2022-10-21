<script setup lang="ts">
// import { ref, computed, PropType } from "vue"
// import { navigateToUrl } from 'single-spa'
// import { useStore } from 'stores/store'
// import { useRoute, useRouter } from 'vue-router'
// import { i18n } from 'boot/i18n'

/* const props = */ defineProps({
  isPrivate: {
    type: Boolean,
    required: true,
    default: true
  }
})
// const emits = defineEmits(['change', 'delete'])

// const { tc } = i18n.global
// const store = useStore()
// const route = useRoute()
// const router = useRouter()

</script>

<template>

  <q-chip v-if="isPrivate" class="non-selectable" color="primary" text-color="white" size="sm" icon="mdi-lock">
    私有访问
  </q-chip>

  <q-chip v-else class="non-selectable" color="green" text-color="white" size="sm" icon="mdi-lock-open-variant">
    公有访问
  </q-chip>

</template>

<style lang="scss" scoped>
</style>
