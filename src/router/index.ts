// import { computed, watch } from 'vue'
import { route } from 'quasar/wrappers'
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory
} from 'vue-router'
import routes from './routes'
import { useStore } from 'stores/store'

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default route(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory)

  const Router = createRouter({
    scrollBehavior: () => ({
      left: 0,
      top: 0
    }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(
      process.env.MODE === 'ssr' ? void 0 : process.env.VUE_ROUTER_BASE
    )
  })

  Router.beforeEach((to, from, next) => {
    // console.log('@cnic/storage ', 'from:', from.fullPath, ' to:', to.fullPath)
    const store = useStore()

    // 根据当前path更新store.items.currentPath
    store.items.currentPath = to.path.split('/').slice(3)

    // // 第一次进入storage时的默认跳转
    // if (to.fullPath === '/my/storage') {
    //   const firstService = computed(() => store.tables.serviceTable.allIds[0])
    //   if (firstService.value !== undefined) {
    //     next('/my/storage/bucket/' + firstService.value)
    //   }
    //   watch(firstService, () => {
    //     if (firstService.value !== undefined) {
    //       next('/my/storage/bucket/' + firstService.value)
    //     }
    //   })
    // }

    next()
  })

  return Router
})
