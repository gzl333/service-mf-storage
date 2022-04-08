import { defineStore } from 'pinia'

export const useStore = defineStore('storage', {
  state: () => ({
    items: {
      currentPath: '' as string // 左侧导航栏当前位置
    },
    tables: {}
  }),
  getters: {
  },
  actions: {
  }
})
