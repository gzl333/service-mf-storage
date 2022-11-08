// storage api

/* eslint-disable camelcase */

import { axiosSingle } from 'boot/axios'

export default {
  single: {
    postJwtRefresh (payload: {
      base: string
      body: { refresh: string }
    }) {
      const data = payload.body
      return axiosSingle.post(payload.base + '/api/v1/jwt-refresh/', data)
    },
    postJwtVerify (payload: {
      base: string
      body: {
        token: string
      }
    }) {
      const data = payload.body
      return axiosSingle.post(payload.base + '/api/v1/jwt-verify/', data)
    },
    postJwt (payload: {
      base: string
      body: {
        username: string
        password: string
      }
    }) {
      const data = payload.body
      return axiosSingle.post(payload.base + '/api/v1/jwt/', data)
    },
    // 注册
    postUsers (payload: {
      base: string
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
      return axiosSingle.post(payload.base + '/api/v1/users/', data)
    },
    // 修改密码
    patchUserName (payload: {
      base: string
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
      return axiosSingle.patch(payload.base + '/api/v1/users/' + payload.path.username + '/', data)
    },
    // ...
    // getBucketToken(){},
    deleteBucketToken (payload: {
      base: string
      path: { token: string }
    }) {
      return axiosSingle.delete(payload.base + '/api/v1/bucket-token/' + payload.path.token + '/')
    },
    getBuckets (payload: {
      base: string
      query?: {
        limit: number
        offset: number
      }
    }) {
      const config = {
        params: payload?.query
      }
      return axiosSingle.get(payload.base + '/api/v1/buckets/', config)
    },
    postBuckets (payload: {
      base: string
      body: {
        name: string
      }
    }) {
      const data = payload.body
      return axiosSingle.post(payload.base + '/api/v1/buckets/', data)
    },
    getBucketsIdOrName (payload: {
      base: string
      path: {
        id_or_name: string
      }
      query?: {
        'by-name': boolean
      }
    }) {
      const config = {
        params: payload?.query
      }
      return axiosSingle.get(payload.base + '/api/v1/buckets/' + payload.path.id_or_name + '/', config)
    },
    // 新建文件夹
    postDirPath (payload: {
      base: string
      path: {
        dirpath: string
        bucket_name: string
      }
    }) {
      return axiosSingle.post(payload.base + '/api/v1/dir/' + payload.path.bucket_name + '/' + payload.path.dirpath + '/')
    },
    // 删除文件夹
    deleteDirPath (payload: {
      base: string
      path: {
        dirpath: string
        bucket_name: string
      }
    }) {
      return axiosSingle.delete(payload.base + '/api/v1/dir/' + payload.path.bucket_name + '/' + payload.path.dirpath + '/')
    },
    // 删除文件
    deleteObjPath (payload: {
      base: string
      path: {
        bucket_name: string
        objpath: string
      }
    }) {
      return axiosSingle.delete(payload.base + '/api/v1/obj/' + payload.path.bucket_name + '/' + payload.path.objpath + '/')
    },
    // 文件重命名
    postObjPath (payload: {
      base: string
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
      return axiosSingle.post(payload.base + '/api/v1/move/' + payload.path.bucket_name + '/' + payload.path.objpath + '/', null, config)
    },
    // 上传文件
    putObjPath (payload: {
      base: string
      path: {
        objpath: string
        bucket_name: string
      }
      body: {
        file: unknown
      }
    }) {
      return axiosSingle.put(payload.base + '/api/v1/obj/' + payload.path.bucket_name + '/' + payload.path.objpath + '/', payload.body.file)
    },
    // 下载文件
    getObjPath (payload: {
      base: string
      path: {
        objpath: string
        p?: string
      }
    }) {
      return axiosSingle.get(payload.base + '/share/obs/' + payload.path.objpath, { responseType: 'blob' })
    },
    // 切片下载文件
    getV1ObjPath (payload: {
      base: string
      path: {
        objpath: string
        bucket_name: string
      },
      query: {
        offset: number
        size: number
      }
    }) {
      const config = {
        params: payload?.query
      }
      return axiosSingle.get(payload.base + '/api/v1/obj/' + payload.path.bucket_name + '/' + payload.path.objpath, config)
    },
    // 下载分享文件
    getSdShareBase (payload: {
      base: string
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
      return axiosSingle.get(payload.base + '/share/sd/' + payload.path.share_base, config)
    },
    // 公开分享文件夹
    patchDirPath (payload: {
      base: string
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
      return axiosSingle.patch(payload.base + '/api/v1/dir/' + payload.path.bucket_name + '/' + payload.path.dirpath + '/', null, config)
    },
    // 公开分享文件
    patchObjPath (payload: {
      base: string
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
      return axiosSingle.patch(payload.base + '/api/v1/obj/' + payload.path.bucket_name + '/' + payload.path.objpath + '/', null, config)
    },
    // 查询链接
    getPath (payload: {
      base: string
      path: {
        path: string
        bucket_name: string
      }
    }) {
      return axiosSingle.get(payload.base + '/api/v1/share/' + payload.path.bucket_name + '/' + payload.path.path)
    },
    // 获取分享列表
    getShareBase (payload: {
      base: string
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
      return axiosSingle.get(payload.base + '/share/list/' + payload.path.share_base, config)
    },
    // getBucketsIdOrName () { },
    patchBucketsIdOrName (payload: {
      base: string
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
      return axiosSingle.patch(payload.base + '/api/v1/buckets/' + payload.path.id_or_name + '/', null, config)
    },
    deleteBucketsIdOrName (payload: {
      base: string
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
      return axiosSingle.delete(payload.base + '/api/v1/buckets/' + payload.path.id_or_name + '/', config)
    },
    patchBucketsIdOrNameRemark (payload: {
      base: string
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
      return axiosSingle.patch(payload.base + '/api/v1/buckets/' + payload.path.id_or_name + '/remark/', null, config)
    },
    postBucketsIdOrNameTokenCreate (payload: {
      base: string
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
      return axiosSingle.post(payload.base + '/api/v1/buckets/' + payload.path.id_or_name + '/token/create/', null, config)
    },
    getBucketsIdOrNameTokenList (payload: {
      base: string
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
      return axiosSingle.get(payload.base + '/api/v1/buckets/' + payload.path.id_or_name + '/token/list/', config)
    },
    // ...
    getDirBucketName (payload: {
      base: string
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
      return axiosSingle.get(payload.base + '/api/v1/dir/' + payload.path.bucket_name + '/', config)
    },
    getDirBucketNameDirPath (payload: {
      base: string
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
      return axiosSingle.get(payload.base + '/api/v1/dir/' + payload.path.bucket_name + '/' + payload.path.dirpath + '/', config)
    },
    // ...
    patchFtpBucketName (payload: {
      base: string
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
      return axiosSingle.patch(payload.base + '/api/v1/ftp/' + payload.path.bucket_name + '/', null, config)
    },
    // ...
    getStatsBucket (payload: {
      base: string
      path: {
        bucket_name: string
      }
    }) {
      return axiosSingle.get(payload.base + '/api/v1/stats/bucket/' + payload.path.bucket_name + '/')
    },
    getSearchObject (payload: {
      base: string
      query: {
        limit?: number
        offset?: number
        bucket: string
        search: string
      }
    }) {
      const config = {
        params: payload.query
      }
      return axiosSingle.get(payload.base + '/api/v1/search/object/', config)
    }
  },
  storage: {
    getAuthToken (payload: {
      base: string
    }) {
      return axiosSingle.get(payload.base + '/api/v1/auth-token/')
    },
    putAuthToken (payload: {
      base: string
    }) {
      return axiosSingle.put(payload.base + '/api/v1/auth-token/')
    },
    getAuthKey (payload: {
      base: string
    }) {
      return axiosSingle.get(payload.base + '/api/v1/auth-key/')
    },
    postAuthKey (payload: {
      base: string
    }) {
      return axiosSingle.post(payload.base + '/api/v1/auth-key/')
    },
    patchAuthKey (payload: {
      base: string,
      path: {
        access_key: string
      }
      query: {
        active: boolean
      }
    }) {
      const config = {
        params: payload.query
      }
      return axiosSingle.patch(payload.base + '/api/v1/auth-key/' + payload.path.access_key + '/', null, config)
    },
    deleteAuthKey (payload: {
      base: string,
      path: {
        access_key: string
      }
    }) {
      return axiosSingle.delete(payload.base + '/api/v1/auth-key/' + payload.path.access_key + '/')
    }
  }
}
