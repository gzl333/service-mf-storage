// vms api
/* eslint-disable camelcase */

import { axiosVms } from 'boot/axios'

export default {
  storage: {
    getStorageService (payload?: {
      query?: {
        page?: number
        page_size?: number
        center_id?: string
        status?: ('enable' | 'disable' | 'deleted')[]
      }
    }) {
      const config = { params: payload?.query }
      return axiosVms.get('/storage/service', config)
    }
  }
}
