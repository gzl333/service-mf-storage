// storage api

/* eslint-disable camelcase */

import { axiosStorage } from 'boot/axios'

export default {
  // stats apis
  api: {
    postJwtRefresh (payload: { body: { refresh: string } }) {
      const data = payload.body
      return axiosStorage.post('/api/v1/jwt-refresh/', data)
    },
    postJwtVerify (payload: {
      body: {
        token: string
      }
    }) {
      const data = payload.body
      return axiosStorage.post('/api/v1/jwt-verify/', data)
    },
    postJwt (payload: {
      body: {
        username: string
        password: string
      }
    }) {
      const data = payload.body
      return axiosStorage.post('/api/v1/jwt/', data)
    },
    // 注册
    postUsers (payload: {
      body: {
        username: string
        password: string
        last_name: string
        first_name: string
        telephone: string
        company: string
      }
    }) {
      const data = payload.body
      return axiosStorage.post('/api/v1/users/', data)
    },
    // 修改密码
    patchUserName (payload: {
      path: {
        username: string
      }
      body: {
        is_active: boolean,
        password: string,
        first_name?: string,
        last_name?: string,
        telephone?: string,
        company?: string
      }
    }) {
      const data = payload.body
      return axiosStorage.patch('/api/v1/users/' + payload.path.username + '/', data)
    },
    // ...
    // getBucketToken(){},
    deleteBucketToken (payload: { path: { token: string } }) {
      return axiosStorage.delete('/api/v1/bucket-token/' + payload.path.token + '/')
    },
    getBuckets (payload?: {
      query?: {
        limit: number
        offset: number
      }
    }) {
      const config = {
        params: payload?.query
      }
      return axiosStorage.get('/api/v1/buckets/', config)
    },
    postBuckets (payload: {
      body: {
        name: string
      }
    }) {
      const data = payload.body
      return axiosStorage.post('/api/v1/buckets/', data)
    },
    // 新建文件夹
    postDirPath (payload: {
      path: {
        dirpath: string
        bucket_name: string
      }
    }) {
      return axiosStorage.post('/api/v1/dir/' + payload.path.bucket_name + '/' + payload.path.dirpath + '/')
    },
    // 删除文件夹
    deleteDirPath (payload: {
      path: {
        dirpath: string
        bucket_name: string
      }
    }) {
      return axiosStorage.delete('/api/v1/dir/' + payload.path.bucket_name + '/' + payload.path.dirpath + '/')
    },
    // 删除文件
    deleteObjPath (payload: {
      path: {
        objpath: string
        bucket_name: string
      }
    }) {
      return axiosStorage.delete('/api/v1/obj/' + payload.path.bucket_name + '/' + payload.path.objpath + '/')
    },
    // 文件重命名
    postObjPath (payload: {
      path: {
        objpath: string
        bucket_name: string
      },
      query: {
        rename?: string
        move_to?: string
      }
    }) {
      const config = {
        params: payload?.query
      }
      return axiosStorage.post('/api/v1/move/' + payload.path.bucket_name + '/' + payload.path.objpath + '/', null, config)
    },
    // 上传文件
    putObjPath (payload: {
      path: {
        objpath: string
        bucket_name: string
      }
      body: {
        file: unknown
      }
    }) {
      return axiosStorage.put('/api/v1/obj/' + payload.path.bucket_name + '/' + payload.path.objpath + '/', payload.body.file)
    },
    // 下载文件
    getObjPath (payload: {
      path: {
        objpath: string
        p?: string
      }
    }) {
      return axiosStorage.get('/share/obs/' + payload.path.objpath, { responseType: 'blob' })
    },
    // 下载分享文件
    getSdShareBase (payload: {
      path: {
        share_base: string
      }
      query: {
        subpath: string
        p?: string
      }
    }) {
      const config = {
        params: payload?.query
      }
      return axiosStorage.get('/share/sd/' + payload.path.share_base, config)
    },
    // 公开分享文件夹
    patchDirPath (payload: {
      path: {
        dirpath: string
        bucket_name: string
      }
      query: {
        share: number
        days: number
        password?: string
      }
    }) {
      const config = {
        params: payload.query
      }
      return axiosStorage.patch('/api/v1/dir/' + payload.path.bucket_name + '/' + payload.path.dirpath + '/', null, config)
    },
    // 公开分享文件
    patchObjPath (payload: {
      path: {
        objpath: string
        bucket_name: string
      }
      query: {
        share: number
        days: number
        password?: string
      }
    }) {
      const config = {
        params: payload.query
      }
      return axiosStorage.patch('/api/v1/obj/' + payload.path.bucket_name + '/' + payload.path.objpath + '/', null, config)
    },
    // 查询链接
    getPath (payload: {
      path: {
        path: string
        bucket_name: string
      }
    }) {
      return axiosStorage.get('/api/v1/share/' + payload.path.bucket_name + '/' + payload.path.path)
    },
    // 获取分享列表
    getShareBase (payload: {
      path: {
        share_base: string
      }
      query?: {
        subpath?: string
        p?: string
      }
    }) {
      const config = {
        params: payload.query
      }
      return axiosStorage.get('/share/list/' + payload.path.share_base, config)
    },
    // getBucketsIdOrName () { },
    patchBucketsIdOrName (payload: {
      path: {
        id_or_name: string
      },
      query: {
        'by-name'?: boolean,
        public: 1 | 2 | 3
      }
    }) {
      const config = {
        params: payload.query
      }
      return axiosStorage.patch('/api/v1/buckets/' + payload.path.id_or_name + '/', null, config)
    },
    deleteBucketsIdOrName (payload: {
      path: {
        id_or_name: string
      },
      query?: {
        'by-name'?: boolean,
        ids?: number[]
      }
    }) {
      const config = {
        params: payload.query
      }
      return axiosStorage.delete('/api/v1/buckets/' + payload.path.id_or_name + '/', config)
    },
    patchBucketsIdOrNameRemark (payload: {
      path: {
        id_or_name: string
      },
      query: {
        'by-name'?: boolean,
        remarks: string
      }
    }) {
      const config = {
        params: payload.query
      }
      return axiosStorage.patch('/api/v1/buckets/' + payload.path.id_or_name + '/remark/', null, config)
    },
    postBucketsIdOrNameTokenCreate (payload: {
      path: {
        id_or_name: string
      },
      query: {
        'by-name': boolean,
        permission: 'readwrite' | 'readonly'
      }
    }) {
      const config = {
        params: payload.query
      }
      return axiosStorage.post('/api/v1/buckets/' + payload.path.id_or_name + '/token/create/', null, config)
    },
    getBucketsIdOrNameTokenList (payload: {
      query?: {
        'by-name'?: boolean
      },
      path: {
        id_or_name: string
      }
    }) {
      const config = {
        params: payload?.query
      }
      return axiosStorage.get('/api/v1/buckets/' + payload.path.id_or_name + '/token/list/', config)
    },
    // ...
    getDirBucketName (payload: {
      query?: {
        limit?: number
        offset?: number
        'only-obj'?: boolean
      },
      path: {
        bucket_name: string
      }
    }) {
      const config = {
        params: payload?.query
      }
      return axiosStorage.get('/api/v1/dir/' + payload.path.bucket_name + '/', config)
    },
    getDirBucketNameDirPath (payload: {
      query?: {
        limit?: number
        offset?: number
        'obj-only'?: boolean
      },
      path: {
        bucket_name: string
        dirpath: string
      }
    }) {
      const config = {
        params: payload?.query
      }
      return axiosStorage.get('/api/v1/dir/' + payload.path.bucket_name + '/' + payload.path.dirpath + '/', config)
    },
    // ...
    patchFtpBucketName (payload: {
      path: {
        bucket_name: string
      },
      query?: {
        enable?: boolean,
        password?: string,
        ro_password?: string
      }
    }) {
      const config = {
        params: payload?.query
      }
      return axiosStorage.patch('/api/v1/ftp/' + payload.path.bucket_name + '/', null, config)
    },
    // ...
    getStatsBucket (payload: {
      path: {
        bucket_name: string
      }
    }) {
      return axiosStorage.get('/api/v1/stats/bucket/' + payload.path.bucket_name + '/')
    }
  }
}
