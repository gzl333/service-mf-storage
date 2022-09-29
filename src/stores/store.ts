import { defineStore } from 'pinia'
import { normalize, schema } from 'normalizr'
import { Dialog } from 'quasar'

import api from 'src/api/index'
import useExceptionNotifier from 'src/hooks/useExceptionNotifier'

import BucketCreateDialog from 'components/bucket/BucketCreateDialog.vue'
import BucketDeleteDialog from 'components/bucket/BucketDeleteDialog.vue'
import BucketFtpPasswordEditDialog from 'components/bucket/BucketFtpPasswordEditDialog.vue'
import BucketNoteEditDialog from 'components/bucket/BucketNoteEditDialog.vue'
import BucketTokenAddDialog from 'components/bucket/BucketTokenAddDialog.vue'
import BucketTokenDeleteDialog from 'components/bucket/BucketTokenDeleteDialog.vue'
import FolderCreateDialog from 'components/bucket/FolderCreateDialog.vue'
import FolderDeleteDialog from 'components/bucket/FolderDeleteDialog.vue'
import UploadDialog from 'components/bucket/UploadDialog.vue'
import FileChangeNameDialog from 'components/bucket/FileChangeNameDialog.vue'
import PublicShareDialog from 'components/bucket/PublicShareDialog.vue'
import AlreadyShareDialog from 'components/bucket/AlreadyShareDialog.vue'

const exceptionNotifier = useExceptionNotifier()

// service对象类象
export interface ServiceInterface {
  id: string
  name: string
  name_en: string
  service_type: string
  endpoint_url: string
  add_time: string
  status: 'enable' | 'disable' | 'deleted'
  remarks: string
  provide_ftp: boolean
  ftp_domains: string[]
  longitude: number
  latitude: number
  pay_app_service_id: string
  data_center: {
    id: string
    name: string
    name_en: string
  }
}

// 桶对象简介类型, 从vms获取，暂定，待vms完善
export interface BucketBriefInterface {
  id: number
  name: string
  user: {
    id: number
    username: string
  },
  created_time: string
  remarks: string

  // 自己补充定义
  local_id: string // 应取name字段
  service_id: string
}

// 桶对象类型，从具体服务获取
export interface BucketInterface {
  id: number
  name: string
  user: {
    id: number
    username: string
  },
  created_time: string
  access_permission: string
  // access_code 待后端添加
  ftp_enable: boolean
  ftp_password: string
  ftp_ro_password: string
  remarks: string

  // 自己补充定义
  local_id: string // 应取name字段
  service_id: string
}

// 桶统计信息对象类型
export interface BucketStatInterface {
  bucket_name: string
  stats: {
    space: number
    count: number
  }
  stats_time: string

  // 自己定义的localId: 取name字段
  localId: string
}

// 桶token对象类型
export interface BucketTokenInterface {
  key: string
  bucket: {
    id: number
    name: string
  }
  permission: string
  created: string
}

// 桶token集合对象类型
export interface BucketTokenSetInterface {
  tokens: BucketTokenInterface[]

  // 自己定义的localId: 取name字段
  localId: string
  // 自己添加字段，方便识别
  bucket_name: string
}

// 单个文件对象类型
export interface FileInterface {
  na: string
  name: string
  fod: boolean
  did: number
  si: number
  ult: string
  upt: string
  dlc: number
  download_url: string
  access_permission: string
  access_code: number
  md5: string
}

// 路径对象类型
export interface PathInterface {
  bucket_name: string
  dir_path: string
  files: FileInterface[]

  // 自己定义的localId，来自serviceId bucket_name dir_path 三者的拼接 'serviceId/bucketName' or 'serviceId/bucketName/path1/path2/path3...'
  localId: string
}

// 文件对象类型
export interface FileObjInterface {
  bucket: string
  dir_path: string
  files: FileInterface[]
}

// 删除文件需要的参数类型
export interface deleteInterface {
  bucket_name: string
  dirpath: {
    dirArrs: string[]
    fileArrs: string[]
  }
}

// 文件分享需要的参数类型
export interface shareInterface {
  bucket_name: string
  dirpath: {
    dirArrs: string[]
    fileArrs: string[]
  }
  share: number
}

// 添加文件需要的参数类型
export interface addFileInterface {
  bucket_name: string
  files: FileInterface
}

// 新建token需要的参数类型
export interface tokenInterface {
  bucket: {
    id: number
    name: string
  }
  created: string
  key: string
  permission: string
}

// export interface ArrayInterface {
//   id: string,
//   desc: string
// }

// export interface searchInterface {
//   tab: ArrayInterface,
//   results: FileInterface[],
// }

/* table的类型 */

// 整体加载表
export interface totalTable {
  status: 'init' | 'loading' | 'total' | 'error'
}

// 累计加载表
export interface partTable {
  status: 'init' | 'loading' | 'part' | 'error'
}

// id
export interface idTable<T> {
  allIds: string[]
  byId: Record<string, T>
}

// localId
export interface localIdTable<T> {
  allLocalIds: string[]
  byLocalId: Record<string, T>
}

/* table的类型 */

/* 表的具体类型 */
export interface ServiceTableInterface extends totalTable, idTable<ServiceInterface> {
}

export interface BucketBriefTableInterface extends partTable, localIdTable<BucketBriefInterface> {
}

export interface BucketTableInterface extends partTable, localIdTable<BucketInterface> {
}

export interface BucketStatTableInterface extends partTable, localIdTable<BucketStatInterface> {
}

export interface BucketTokenSetTableInterface extends partTable, localIdTable<BucketTokenSetInterface> {
}

export interface PathTableInterface extends partTable, localIdTable<PathInterface> {
}

/* 表的具体类型 */

export const useStore = defineStore('storage', {
  state: () => ({
    items: {
      // 实时记录用户所在app局部路径位置
      // 例如'/my/server/personal/list' -> ['personal', 'list'], 供二级三级导航栏在刷新时保持选择使用
      currentPath: [] as string[]
    },
    tables: {
      serviceTable: {
        status: 'init',
        allIds: [],
        byId: {}
      } as ServiceTableInterface,
      bucketBriefTable: {
        status: 'init',
        allLocalIds: [],
        byLocalId: {}
      } as BucketBriefTableInterface,
      bucketTable: {
        status: 'init',
        allLocalIds: [],
        byLocalId: {}
      } as BucketTableInterface,
      bucketStatTable: {
        status: 'init',
        allLocalIds: [],
        byLocalId: {}
      } as BucketStatTableInterface,
      bucketTokenTable: {
        status: 'init',
        allLocalIds: [],
        byLocalId: {}
      } as BucketTokenSetTableInterface,
      pathTable: {
        status: 'init',
        allLocalIds: [],
        byLocalId: {}
      } as PathTableInterface
    }
  }),
  getters: {
    getIntegratedSearchOptions (state): Record<string, string>[] {
      const bucketOptions = []
      let obj: Record<string, string> = {}
      for (const objElement of state.tables.bucketTable.allLocalIds) {
        obj = {}
        obj.id = state.tables.bucketTable.byLocalId[objElement].local_id
        // obj.id = state.tables.serviceTable.byId[state.tables.bucketTable.byLocalId[objElement].service_id].name + '/' + state.tables.bucketTable.byLocalId[objElement].name
        obj.desc = state.tables.serviceTable.byId[state.tables.bucketTable.byLocalId[objElement].service_id].name + '/' + state.tables.bucketTable.byLocalId[objElement].name
        bucketOptions.push(obj)
      }
      return bucketOptions
    },
    getFirstsIntegratedSearchOption (state): string {
      let bucketName = ''
      // const obj: Record<string, string> = {}
      // obj.id = state.tables.bucketTable.byLocalId[state.tables.bucketTable.allLocalIds[0]]?.local_id
      // obj.desc = state.tables.serviceTable.byId[state.tables.bucketTable.byLocalId[state.tables.bucketTable.allLocalIds[0]]?.service_id]?.name + '/' + state.tables.bucketTable.byLocalId[state.tables.bucketTable.allLocalIds[0]]?.name
      bucketName = state.tables.serviceTable.byId[state.tables.bucketTable.byLocalId[state.tables.bucketTable.allLocalIds[0]]?.service_id]?.name + '/' + state.tables.bucketTable.byLocalId[state.tables.bucketTable.allLocalIds[0]]?.name
      return bucketName
    },
    getFirstsIntegratedSearchOptionId (state): string {
      let bucketName = ''
      bucketName = state.tables.bucketTable.byLocalId[state.tables.bucketTable.allLocalIds[0]]?.local_id
      return bucketName
    },
    getBuckets (state): Record<string, string>[] {
      const bucketOptions = []
      let obj: Record<string, string> = {}
      for (const objElement of state.tables.bucketTable.allLocalIds) {
        obj = {}
        obj.id = objElement
        obj.desc = objElement
        bucketOptions.push(obj)
      }
      return bucketOptions
    },
    getFirstsBucket (state): string {
      let bucketName = ''
      bucketName = state.tables.bucketTable.allLocalIds[0]
      return bucketName
    }
  },
  actions: {
    // loadAllItems () {},
    async loadAllTables () {
      if (this.tables.serviceTable.status === 'init') {
        // 加载serviceTable
        void await this.loadServiceTable()
        // 加载全部bucketTable
        this.tables.serviceTable.allIds.forEach((serviceId) => {
          void this.addBucketTable(serviceId)
        })
      }
    },
    async loadServiceTable () {
      this.tables.serviceTable.status = 'loading'
      try {
        const respGetService = await api.vms.storage.getStorageService({ query: { status: ['enable'] } })
        respGetService.data.results.forEach((item: ServiceInterface) => {
          // normalize
          const service = new schema.Entity('service')
          const normalizedData = normalize(item, service)
          // 存入state
          Object.assign(this.tables.serviceTable.byId, normalizedData.entities.service)
          this.tables.serviceTable.allIds.push(Object.keys(normalizedData.entities.service as Record<string, unknown>)[0])
          this.tables.serviceTable.allIds = [...new Set(this.tables.serviceTable.allIds)]
        })
        this.tables.serviceTable.status = 'total'
      } catch (exception) {
        exceptionNotifier(exception)
        this.tables.serviceTable.status = 'error'
      }
    },
    // bucketTable应从vms读取，是粗略的信息
    async addBucketTable (serviceId: string) {
      const base = this.tables.serviceTable.byId[serviceId]?.endpoint_url
      // 1. status改为loading
      this.tables.bucketTable.status = 'loading'
      try {
        // 2. 发送网络请求，格式化数据，保存对象
        const respGetBuckets = await api.storage.single.getBuckets({ base })
        for (const bucket of respGetBuckets.data.buckets) {
          Object.assign(this.tables.bucketTable.byLocalId, {
            [serviceId + '/' + bucket.name]: Object.assign(bucket, {
              local_id: bucket.name,
              service_id: serviceId
            })
          })
          // this.tables.bucketTable.allLocalIds.unshift(Object.keys({ [serviceId + '/' + bucket.name]: Object.assign(bucket, { local_id: serviceId + '/' + bucket.name }) })[0])
          this.tables.bucketTable.allLocalIds.unshift(serviceId + '/' + bucket.name)
          this.tables.bucketTable.allLocalIds = [...new Set(this.tables.bucketTable.allLocalIds)]
        }
        // 3. status改为total
        this.tables.bucketTable.status = 'part'
      } catch (exception) {
        exceptionNotifier(exception)
        this.tables.bucketTable.status = 'error'
      }
    },
    async getSearchTable (serviceId: string, keyword: string) {
      const base = this.tables.serviceTable.byId[this.tables.bucketTable.byLocalId[serviceId]?.service_id]?.endpoint_url
      const bucketName = this.tables.bucketTable.byLocalId[serviceId]?.name
      // 2. 发送网络请求，格式化数据，保存对象
      const respGetBuckets = await api.storage.single.getSearchObject({ base, query: { bucket: bucketName, search: keyword } })
      return respGetBuckets
    },
    // bucketStatTable: 累积加载，localId
    async addBucketStatTable (serviceId: string, bucketName: string) {
      const base = this.tables.serviceTable.byId[serviceId]?.endpoint_url
      // 1. status改为loading
      this.tables.bucketStatTable.status = 'loading'
      try {
        // 2. 发送网络请求，格式化数据，保存对象
        const respGetStatsBucket = await api.storage.single.getStatsBucket({
          base,
          path: { bucket_name: bucketName }
        })
        const item = {
          [serviceId + '/' + bucketName]: Object.assign({}, {
            localId: respGetStatsBucket.data.bucket_name,
            bucket_name: respGetStatsBucket.data.bucket_name,
            stats: respGetStatsBucket.data.stats,
            stats_time: respGetStatsBucket.data.stats_time
          })
        }
        Object.assign(this.tables.bucketStatTable.byLocalId, item)
        // this.tables.bucketStatTable.allLocalIds.unshift(Object.keys(item)[0])
        this.tables.bucketStatTable.allLocalIds.unshift(serviceId + '/' + bucketName)
        this.tables.bucketStatTable.allLocalIds = [...new Set(this.tables.bucketStatTable.allLocalIds)]
        // 3. status改为part
        this.tables.bucketStatTable.status = 'part'
      } catch (exception) {
        exceptionNotifier(exception)
        this.tables.bucketStatTable.status = 'error'
      }
    },
    // bucketTokenTable: 累积加载，localId
    async addBucketTokenTable (serviceId: string, bucketName: string) {
      const base = this.tables.serviceTable.byId[serviceId]?.endpoint_url
      // 1. status改为loading
      this.tables.bucketTokenTable.status = 'loading'
      try {
        // 2. 发送网络请求，格式化数据，保存对象
        const respGetBucketTokenList = await api.storage.single.getBucketsIdOrNameTokenList({
          base,
          query: { 'by-name': true },
          path: { id_or_name: bucketName }
        })
        const item = {
          [serviceId + '/' + bucketName]: Object.assign({}, {
            localId: bucketName,
            bucket_name: bucketName,
            tokens: respGetBucketTokenList.data.tokens
          })
        }
        Object.assign(this.tables.bucketTokenTable.byLocalId, item)
        // this.tables.bucketTokenTable.allLocalIds.unshift(Object.keys(item)[0])
        this.tables.bucketTokenTable.allLocalIds.unshift(serviceId + '/' + bucketName)
        this.tables.bucketTokenTable.allLocalIds = [...new Set(this.tables.bucketTokenTable.allLocalIds)]
        // 3. status改为part
        this.tables.bucketTokenTable.status = 'part'
      } catch (exception) {
        exceptionNotifier(exception)
        this.tables.bucketTokenTable.status = 'error'
      }
    },
    // PathTable: 累积加载，localId (serviceId-bucketName/path1/path2)
    async addPathTable (serviceId: string, bucketName: string, path?: string) {
      const base = this.tables.serviceTable.byId[serviceId]?.endpoint_url
      // 1. status改为loading
      this.tables.pathTable.status = 'loading'
      try {
        // 2. 判断是桶根目录还是次级目录，判断是否已经有了: 没有发送网络请求，格式化数据，保存对象
        // const currentPath = payload.bucket + (payload.path ? ('/' + payload.path) : '')
        // if (!context.state.tables.pathTable.allLocalIds.includes(currentPath)) {
        if (!path) { // 桶的根目录
          const respGetDirBucket = await api.storage.single.getDirBucketName({
            base,
            path: { bucket_name: bucketName }
          })
          const item = {
            [serviceId + '/' + bucketName]: Object.assign({}, {
              localId: serviceId + '/' + bucketName,
              bucket_name: respGetDirBucket.data.bucket_name,
              dir_path: respGetDirBucket.data.dir_path,
              files: respGetDirBucket.data.files
            })
          }
          Object.assign(this.tables.pathTable.byLocalId, item)
          // this.tables.pathTable.allLocalIds.unshift(Object.keys(item)[0])
          this.tables.pathTable.allLocalIds.unshift(serviceId + '/' + bucketName)
          this.tables.pathTable.allLocalIds = [...new Set(this.tables.pathTable.allLocalIds)]
        } else { // 次级目录
          const respGetDirPath = await api.storage.single.getDirBucketNameDirPath({
            base: this.tables.serviceTable.byId[serviceId].endpoint_url,
            path: {
              bucket_name: bucketName,
              dirpath: path
            }
          })
          const item = {
            [serviceId + '/' + bucketName + '/' + path]: Object.assign({}, {
              localId: serviceId + '/' + bucketName + '/' + respGetDirPath.data.dir_path,
              bucket_name: respGetDirPath.data.bucket_name,
              dir_path: respGetDirPath.data.dir_path,
              files: respGetDirPath.data.files
            })
          }
          Object.assign(this.tables.pathTable.byLocalId, item)
          // this.tables.pathTable.allLocalIds.unshift(Object.keys(item)[0])
          this.tables.pathTable.allLocalIds.unshift(serviceId + '/' + bucketName + '/' + path)
          this.tables.pathTable.allLocalIds = [...new Set(this.tables.pathTable.allLocalIds)]
        }
        // }
        // 3. status改为part
        this.tables.pathTable.status = 'part'
      } catch (exception) {
        exceptionNotifier(exception)
        this.tables.pathTable.status = 'error'
      }
    },
    // 修改桶备注
    async storeBucketNote (payload: { id: string, value: string }) {
      this.tables.bucketTable.byLocalId[payload.id].remarks = payload.value
    },
    // 新建token
    async storeBucketToken (payload: { id: string, value: tokenInterface[] }) {
      this.tables.bucketTokenTable.byLocalId[payload.id].tokens = payload.value
    },
    // 添加文件
    storeSingleFileItem (payload: { item: addFileInterface }) {
      this.tables.pathTable.byLocalId[payload.item.bucket_name].files.unshift(payload.item.files)
    },
    // 文件重命名
    changeObjName (payload: { item: Record<string, string> }) {
      this.tables.pathTable.byLocalId[payload.item.bucket_name].files.forEach((item) => {
        if (item.name === payload.item.dirName) {
          item.name = payload.item.newName
        }
      })
    },
    // 文件更改分享状态
    changeShareStatus (payload: { item: shareInterface }) {
      if (payload.item.dirpath.dirArrs !== undefined && payload.item.dirpath.dirArrs.length > 0) {
        payload.item.dirpath.dirArrs.forEach((dir: string) => {
          const index = this.tables.pathTable.byLocalId[payload.item.bucket_name].files.findIndex(item => item.name === dir)
          if (payload.item.share === 0) {
            this.tables.pathTable.byLocalId[payload.item.bucket_name].files[index].access_code = 0
            this.tables.pathTable.byLocalId[payload.item.bucket_name].files[index].access_permission = '私有'
          } else {
            this.tables.pathTable.byLocalId[payload.item.bucket_name].files[index].access_code = 1
            this.tables.pathTable.byLocalId[payload.item.bucket_name].files[index].access_permission = '公有'
          }
        })
      }
      if (payload.item.dirpath.fileArrs !== undefined && payload.item.dirpath.fileArrs.length > 0) {
        payload.item.dirpath.fileArrs.forEach((file: string) => {
          const index = this.tables.pathTable.byLocalId[payload.item.bucket_name].files.findIndex(item => item.name === file)
          if (payload.item.share === 0) {
            this.tables.pathTable.byLocalId[payload.item.bucket_name].files[index].access_code = 0
            this.tables.pathTable.byLocalId[payload.item.bucket_name].files[index].access_permission = '私有'
          } else {
            this.tables.pathTable.byLocalId[payload.item.bucket_name].files[index].access_code = 1
            this.tables.pathTable.byLocalId[payload.item.bucket_name].files[index].access_permission = '公有'
          }
        })
      }
    },
    // 删除文件
    async deleteObjItem (payload: { domain: string, bucket_name: string, objPath: string }) {
      const base = this.tables.serviceTable.byId[this.tables.bucketTable.byLocalId[payload.domain]?.service_id]?.endpoint_url
      let status = 0
      const res = await api.storage.single.deleteObjPath({ base, path: { bucket_name: payload.bucket_name, objpath: payload.objPath } })
      status = res.status
      return status
    },
    async shareObjItem (payload: { domain: string, path: { bucket_name: string, objPath: string }, query: { share: number, days: number, password?: string }}) {
      const query = payload.query
      const base = this.tables.serviceTable.byId[this.tables.bucketTable.byLocalId[payload.domain]?.service_id]?.endpoint_url
      void await api.storage.single.patchObjPath({
        base,
        path: {
          bucket_name: payload.path.bucket_name,
          objpath: payload.path.objPath
        },
        query
      })
    },
    async downloadObjItem (payload: { domain: string, path: { objPath: string }}) {
      const base = this.tables.serviceTable.byId[this.tables.bucketTable.byLocalId[payload.domain]?.service_id]?.endpoint_url
      const res = await api.storage.single.getObjPath({ base, path: { objpath: payload.path.objPath } })
      return res
    },
    async changeObjNameItem (payload: { domain: string, path: { bucket_name: string, objPath: string }, query: { rename: string }}) {
      const query = payload.query
      const base = this.tables.serviceTable.byId[this.tables.bucketTable.byLocalId[payload.domain]?.service_id]?.endpoint_url
      const respGetDir = await api.storage.single.postObjPath({ base, path: { bucket_name: payload.path.bucket_name, objpath: payload.path.objPath }, query })
      console.log(respGetDir)
    },
    // 删除文件
    deleteFile (payload: { item: deleteInterface }) {
      if (payload.item.dirpath.dirArrs.length > 0) {
        this.tables.pathTable.byLocalId[payload.item.bucket_name].files = this.tables.pathTable.byLocalId[payload.item.bucket_name].files.filter((item) => !payload.item.dirpath.dirArrs.includes(item.name))
      }
      if (payload.item.dirpath.fileArrs.length > 0) {
        this.tables.pathTable.byLocalId[payload.item.bucket_name].files = this.tables.pathTable.byLocalId[payload.item.bucket_name].files.filter((item) => !payload.item.dirpath.fileArrs.includes(item.name))
      }
    },
    /* dialogs */
    // 触发新建存储桶对话框
    triggerCreateBucketDialog (serviceId: string) {
      Dialog.create({
        component: BucketCreateDialog,
        componentProps: {
          serviceId
        }
      })
    },
    // 触发删除存储桶对话框
    triggerDeleteBucketDialog (serviceId: string, bucketNames: string[]) {
      Dialog.create({
        component: BucketDeleteDialog,
        componentProps: {
          serviceId,
          bucketNames
        }
      })
    },
    // 新建文件夹
    triggerCreateFolderDialog (payload: { dirName: string }) {
      Dialog.create({
        component: FolderCreateDialog,
        componentProps: {
          bucket_name: payload.dirName
        }
      })
    },
    // 删除文件夹
    triggerDeleteFolderDialog (payload: { domain: string, localId: string, dirNames: { dirArrs?: string[], fileArrs?: string[] }, isSearch?: boolean }) {
      Dialog.create({
        component: FolderDeleteDialog,
        componentProps: {
          domain: payload.domain,
          bucket_name: payload.localId,
          dirpath: payload.dirNames,
          isSearch: payload.isSearch
        }
      })
    },
    // 公开分享
    triggerPublicShareDialog (payload: { domain: string, localId: string, dirNames: { dirArrs?: string[], fileArrs?: string[] }, isSearch?: boolean }) {
      Dialog.create({
        component: PublicShareDialog,
        componentProps: {
          domain: payload.domain,
          bucket_name: payload.localId,
          pathObj: payload.dirNames,
          isSearch: payload.isSearch
        }
      })
    },
    // 已经分享
    triggerAlreadyShareDialog (payload: { localId: string, dirNames: { dirArrs?: string[], fileArrs?: string[] } }) {
      Dialog.create({
        component: AlreadyShareDialog,
        componentProps: {
          bucket_name: payload.localId,
          pathObj: payload.dirNames
        }
      })
    },
    // 文件重命名
    triggerChangeFolderDialog (payload: { domain: string, localId: string, objPath: string, dirName: string, isSearch?: boolean }) {
      Dialog.create({
        component: FileChangeNameDialog,
        componentProps: {
          domain: payload.domain,
          bucket_name: payload.localId,
          objpath: payload.objPath,
          dirName: payload.dirName,
          isSearch: payload.isSearch
        }
      })
    },
    // 上传文件
    triggerUploadDialog (payload: { bucket_name: string }) {
      Dialog.create({
        component: UploadDialog,
        componentProps: {
          bucket_name: payload.bucket_name
        }
      })
    },
    // 修改存储桶ftp密码
    triggerEditBucketFtpPasswordDialog (serviceId: string, bucketName: string, isRo: boolean) {
      Dialog.create({
        component: BucketFtpPasswordEditDialog,
        componentProps: {
          serviceId,
          bucketName,
          isRo
        }
      })
    },
    // 修改存储桶备注
    triggerEditBucketNoteDialog (serviceId: string, bucketName: string) {
      Dialog.create({
        component: BucketNoteEditDialog,
        componentProps: {
          serviceId,
          bucketName
        }
      })
    },
    // 创建存储桶token
    triggerAddBucketTokenDialog (serviceId: string, bucketName: string) {
      Dialog.create({
        component: BucketTokenAddDialog,
        componentProps: {
          serviceId,
          bucketName
        }
      })
    },
    // 删除存储桶的token
    triggerDeleteBucketTokenDialog (serviceId: string, bucketName: string, tokenKey: string) {
      Dialog.create({
        component: BucketTokenDeleteDialog,
        componentProps: {
          serviceId,
          bucketName,
          tokenKey
        }
      })
    },
    // 切换存储桶web访问权限
    async toggleBucketAccess (serviceId: string, bucketName: string) {
      const base = this.tables.serviceTable.byId[serviceId]?.endpoint_url
      this.tables.bucketTable.status = 'loading'
      try {
        const respPatchAccess = await api.storage.single.patchBucketsIdOrName({
          base,
          path: { id_or_name: bucketName },
          query: {
            'by-name': true,
            public: this.tables.bucketTable.byLocalId[serviceId + '/' + bucketName]?.access_permission === '私有' ? 1 : 2
          }
        })
        this.tables.bucketTable.byLocalId[serviceId + '/' + bucketName].access_permission = respPatchAccess.data.public === 1 ? '公有' : '私有'
        this.tables.bucketTable.status = 'part'
      } catch (exception) {
        this.tables.bucketTable.status = 'error'
        exceptionNotifier(exception)
      }
    },
    // 切换存储桶FTP状态
    async toggleBucketFtp (serviceId: string, bucketName: string) {
      const base = this.tables.serviceTable.byId[serviceId]?.endpoint_url
      this.tables.bucketTable.status = 'loading'
      try {
        const respPatchFtp = await api.storage.single.patchFtpBucketName({
          base,
          path: { bucket_name: bucketName },
          query: {
            enable: this.tables.bucketTable.byLocalId[serviceId + '/' + bucketName]?.ftp_enable !== true
          }
        })
        this.tables.bucketTable.byLocalId[serviceId + '/' + bucketName].ftp_enable = respPatchFtp.data.data.enable
        this.tables.bucketTable.status = 'part'
      } catch (exception) {
        this.tables.bucketTable.status = 'error'
        exceptionNotifier(exception)
      }
    }
  }
})
