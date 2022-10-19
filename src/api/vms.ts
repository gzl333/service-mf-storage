// vms api
/* eslint-disable camelcase */

import { axiosVms } from 'boot/axios'

export default {
  storage: {
    getStorageBucket (payload?: {
      query?: {
        page?: number
        page_size?: number
        service_id?: string
      }
    }) {
      const config = { params: payload?.query }
      return axiosVms.get('/storage/bucket', config)
    },
    postStorageBucket (payload: {
      body: {
        service_id: string
        name: string
      }
    }) {
      return axiosVms.post('/storage/bucket', payload.body)
    },
    deleteStorageBucket (payload: {
      path: {
        bucket_name: string
        service_id: string
      }
    }) {
      return axiosVms.delete('/storage/bucket/' + payload.path.bucket_name + '/service/' + payload.path.service_id)
    },
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
