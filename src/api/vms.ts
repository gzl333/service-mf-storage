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
  },
  cashcoupon: {
    getCashCoupon (payload: {
      query?: {
        page?: number,
        page_size?: number,
        app_service_id?: string,
        vo_id?: string,
        available?: string,
        app_service_category?: 'vms-server' | 'vms-object' | 'high-cloud' | 'hpc' | 'other'
      }
    }) {
      const config = {
        params: payload.query
      }
      return axiosVms.get('/cashcoupon', config)
    },
    postCashCoupon (payload: {
      query: {
        id: string,
        coupon_code: string,
        vo_id?: string
      }
    }) {
      const config = {
        params: payload.query
      }
      return axiosVms.post('/cashcoupon', null, config)
    },
    postCashCouponExchange (payload: {
      query: {
        code: string;
        vo_id?: string;
      }
    }) {
      const config = {
        params: payload.query
      }
      return axiosVms.post('/cashcoupon/exchange', null, config)
    },
    deleteCashCoupon (payload: {
      path: {
        id: string;
      },
      query?: {
        force?: string;
      }
    }) {
      const config = {
        params: payload?.query
      }
      return axiosVms.delete('/cashcoupon/' + payload.path.id, config)
    },
    getCashCouponPayment (payload: {
      path: {
        id: string;
      },
      query?: {
        page?: number;
        page_size?: number;
      }
    }) {
      const config = {
        params: payload?.query
      }
      return axiosVms.get('/cashcoupon/' + payload.path.id + '/payment', config)
    }
  }
}
