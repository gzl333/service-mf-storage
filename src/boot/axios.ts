import { boot } from 'quasar/wrappers'
import axios, { AxiosInstance, AxiosError } from 'axios'
import qs from 'qs'

// @ts-expect-error
import { useStoreMain } from '@cnic/main'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
  }
}

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)
// const api = axios.create({ baseURL: 'https://api.example.com' })

// 只配置序列化器，没有api base url，需要调用时指定具体api
const axiosSingle = axios.create({
  paramsSerializer: function (params) {
    return qs.stringify(params, { arrayFormat: 'repeat' })
  }
})

// axios instance with base url configured
const axiosVms = axios.create({
  // baseURL: 'https://vms.cstcloud.cn/api',
  baseURL: 'https://servicebackend.cstcloud.cn/api',
  // 序列化器，没有这个无法在query里发送数组参数。body里的数组不需要序列化器。
  // https://github.com/axios/axios/issues/604#issuecomment-321460450
  paramsSerializer: function (params) {
    return qs.stringify(params, { arrayFormat: 'repeat' })
  }
})

// axios instance with base url configured
export const baseURLStorage = window.location.protocol + '//obs.cstcloud.cn' // todo 改成该服务的后端api地址
const axiosStorage = axios.create({
  baseURL: baseURLStorage,
  // 序列化器，没有这个无法在query里发送数组参数。body里的数组不需要序列化器。
  // https://github.com/axios/axios/issues/604#issuecomment-321460450
  paramsSerializer: function (params) {
    return qs.stringify(params, { arrayFormat: 'repeat' })
  }
})

/* 原生axios的拦截器 */
axios.interceptors.request.use(config => {
  return config
}, (error: AxiosError) => {
  return Promise.reject(error)
})
axios.interceptors.response.use(config => {
  return config
}, (error: AxiosError) => {
  return Promise.reject(error)
})
/* 原生axios的拦截器 */

/* axiosVms的拦截器 */
axiosVms.interceptors.request.use(config => {
  // get jwt token from @cnic/main's store
  const store = useStoreMain()
  Object.assign(config, store.items.isLogin ? { headers: { Authorization: `Bearer ${store.items.tokenAccess as string}` } } : {}) // 登录状态使用token，未登录状态不传token
  return config
}, (error: AxiosError) => {
  return Promise.reject(error)
})
axiosVms.interceptors.response.use(config => {
  return config
}, (error: AxiosError) => {
  return Promise.reject(error)
})
/* axiosVms的拦截器 */

/* axiosSingle的拦截器 */
axiosSingle.interceptors.request.use(config => {
  // get jwt token from @cnic/main's store
  const store = useStoreMain()
  Object.assign(config, store.items.isLogin ? { headers: { Authorization: `AAI-JWT ${store.items.tokenAccess as string}` } } : {})
  return config
}, (error: AxiosError) => {
  return Promise.reject(error)
})
axiosSingle.interceptors.response.use(config => {
  return config
}, (error: AxiosError) => {
  return Promise.reject(error)
})
/* axiosSingle的拦截器 */

/* axiosStorage的拦截器 */
axiosStorage.interceptors.request.use(config => {
  // get jwt token from @cnic/main's store
  const store = useStoreMain()
  Object.assign(config, store.items.isLogin ? { headers: { Authorization: `AAI-JWT ${store.items.tokenAccess as string}` } } : {})
  return config
}, (error: AxiosError) => {
  return Promise.reject(error)
})
axiosStorage.interceptors.response.use(config => {
  return config
}, (error: AxiosError) => {
  return Promise.reject(error)
})
/* axiosStorage的拦截器 */

export default boot((/* { app } */) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api

  // app.config.globalProperties.$axios = axios
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  // app.config.globalProperties.$api = api
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API
})

export { axios, axiosVms, axiosSingle, axiosStorage }
