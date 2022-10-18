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

/*
*   {
      "id": "5afe3b8e-4deb-11ed-9be2-c8009fe2eb03",
      "name": "fe-1",
      "creation_time": "2022-10-17T07:14:35.760980Z",
      "user_id": "6",
      "username": "zlguo@cnic.cn",
      "service": {
        "id": "da7ca81e-46de-11ed-af9d-c8009fe2eb03",
        "name": "运维大数据平台对象存储",
        "name_en": "运维大数据平台obs"
      }
    }
    *  */

// 桶简介对象类型, 从vms获取
export interface BucketBriefInterface {
  id: string // 存储桶在vms中的id
  name: string // 存储桶在vms中的name， 与具体服务中一致
  creation_time: string
  user_id: string
  username: string
  service: {
    id: string
    name: string
    name_en: string
  }
}

/*
*
* {
      "id": 60089,
      "name": "fe-1",
      "user": {
        "id": 90001,
        "username": "zlguo@cnic.cn"
      },
      "created_time": "2022-10-17T15:14:27.934308+08:00",
      "access_permission": "私有",
      "ftp_enable": false,
      "ftp_password": "fc5b5af529",
      "ftp_ro_password": "7d4aed9f27",
      "remarks": ""
    }
    * */

// 桶详情对象类型，从具体服务获取
export interface BucketDetailInterface {
  id: number // 存储桶在各个具体服务中的id
  name: string // 存储桶在具体服务中的name，与vms中一致
  user: {
    id: number
    username: string
  },
  created_time: string
  access_permission: string
  ftp_enable: boolean
  ftp_password: string
  ftp_ro_password: string
  remarks: string
}

// 完整桶对象类型，包含brief和detail
export interface BucketTotalInterface extends BucketBriefInterface {
  detail: BucketDetailInterface
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

// 代金券对象类型
export interface CouponInterface {
  id: string
  face_value: string
  creation_time: string
  effective_time: string
  expiration_time: string
  balance: string
  status: 'wait' | 'available' | 'cancelled' | 'deleted'
  granted_time?: string
  owner_type?: 'user' | 'vo'
  app_service?: {
    id: string
    name: string
    name_en: string
    category: 'vms-server' | 'vms-object' | 'high-cloud' | 'hpc' | 'other'
    service_id: string | null
  },
  user?: {
    id: string
    username: string
  }
  vo?: {
    id: string
    name: string
  }
  activity?: {
    id: string
    name: string
  }
}

// 文件对象类型
export interface FileObjInterface {
  bucket: string
  dir_path: string
  files: FileInterface[]
}

// 删除文件需要的参数类型
export interface deleteInterface {
  localId: string
  dirpath: {
    dirArrs: string[]
    fileArrs: string[]
  }
}

// 文件分享需要的参数类型
export interface shareInterface {
  bucket_name: string
  dirpath: {
    dirArrs: Record<string, string>[]
    fileArrs: Record<string, string>[]
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

export interface StatusInterface {
  na: string,
  name: string
}

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
      currentPath: [] as string[],
      // 分享链接所用的服务单元信息
      shareService: {} as ServiceInterface
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
    },
    getIntegratedSearchOptions (state): Record<string, string>[] {
      const bucketOptions = []
      let obj: Record<string, string> = {}
      for (const objElement of state.tables.bucketTable.allLocalIds) {
        obj = {}
        obj.id = state.tables.bucketTable.byLocalId[objElement]?.service_id + '/' + state.tables.bucketTable.byLocalId[objElement].local_id
        // obj.id = state.tables.serviceTable.byId[state.tables.bucketTable.byLocalId[objElement].service_id].name + '/' + state.tables.bucketTable.byLocalId[objElement].name
        obj.desc = state.tables.serviceTable.byId[state.tables.bucketTable.byLocalId[objElement].service_id].name + '/' + state.tables.bucketTable.byLocalId[objElement].name
        bucketOptions.push(obj)
      }
      return bucketOptions
    },
    getFirstsIntegratedSearchOptionName (state): string {
      let name = ''
      name = state.tables.serviceTable.byId[state.tables.bucketTable.byLocalId[state.tables.bucketTable.allLocalIds[0]]?.service_id]?.name + '/' + state.tables.bucketTable.byLocalId[state.tables.bucketTable.allLocalIds[0]]?.name
      return name
    },
    getFirstsIntegratedSearchOptionId (state): string {
      let localId = ''
      localId = state.tables.bucketTable.byLocalId[state.tables.bucketTable.allLocalIds[0]]?.service_id + '/' + state.tables.bucketTable.byLocalId[state.tables.bucketTable.allLocalIds[0]]?.local_id
      return localId
    },
    getFirstIntrgratedSearchOptions (state): Record<string, string> {
      const obj: Record<string, string> = {}
      obj.id = state.tables.bucketTable.byLocalId[state.tables.bucketTable.allLocalIds[0]]?.service_id + '/' + state.tables.bucketTable.byLocalId[state.tables.bucketTable.allLocalIds[0]]?.local_id
      obj.desc = state.tables.serviceTable.byId[state.tables.bucketTable.byLocalId[state.tables.bucketTable.allLocalIds[0]]?.service_id]?.name + '/' + state.tables.bucketTable.byLocalId[state.tables.bucketTable.allLocalIds[0]]?.name
      return obj
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
    // 读取全部服务单元的存储桶，后端分页，条目在vms取，详情在各个服务单元的api取 todo
    // async loadBucketTable () {
    // },
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
    // 文件更改分享状态
    changeShareStatus (fileStatus: shareInterface) {
      if (fileStatus.dirpath.dirArrs !== undefined && fileStatus.dirpath.dirArrs.length > 0) {
        fileStatus.dirpath.dirArrs.forEach(dir => {
          const index = this.tables.pathTable.byLocalId[fileStatus.bucket_name].files.findIndex(item => item.name === dir.name)
          if (fileStatus.share === 0) {
            this.tables.pathTable.byLocalId[fileStatus.bucket_name].files[index].access_code = 0
            this.tables.pathTable.byLocalId[fileStatus.bucket_name].files[index].access_permission = '私有'
          } else {
            this.tables.pathTable.byLocalId[fileStatus.bucket_name].files[index].access_code = 1
            this.tables.pathTable.byLocalId[fileStatus.bucket_name].files[index].access_permission = '公有'
          }
        })
      }
      if (fileStatus.dirpath.fileArrs !== undefined && fileStatus.dirpath.fileArrs.length > 0) {
        fileStatus.dirpath.fileArrs.forEach(file => {
          const index = this.tables.pathTable.byLocalId[fileStatus.bucket_name].files.findIndex(item => item.name === file.name)
          if (fileStatus.share === 0) {
            this.tables.pathTable.byLocalId[fileStatus.bucket_name].files[index].access_code = 0
            this.tables.pathTable.byLocalId[fileStatus.bucket_name].files[index].access_permission = '私有'
          } else {
            this.tables.pathTable.byLocalId[fileStatus.bucket_name].files[index].access_code = 1
            this.tables.pathTable.byLocalId[fileStatus.bucket_name].files[index].access_permission = '公有'
          }
        })
      }
    },
    // 删除文件
    deleteFile (deleteItem: deleteInterface) {
      if (deleteItem.dirpath.dirArrs.length > 0) {
        this.tables.pathTable.byLocalId[deleteItem.localId].files = this.tables.pathTable.byLocalId[deleteItem.localId].files.filter((item) => !deleteItem.dirpath.dirArrs.includes(item.name))
      }
      if (deleteItem.dirpath.fileArrs.length > 0) {
        this.tables.pathTable.byLocalId[deleteItem.localId].files = this.tables.pathTable.byLocalId[deleteItem.localId].files.filter((item) => !deleteItem.dirpath.fileArrs.includes(item.name))
      }
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
    triggerCreateFolderDialog (localId: string, bucketName: string, dirPath: string) {
      Dialog.create({
        component: FolderCreateDialog,
        componentProps: {
          localId,
          bucketName,
          dirPath
        }
      })
    },
    // 删除文件夹
    triggerDeleteFolderDialog (localId: string, bucketName: string, dirNames: { dirArrs?: Record<string, string>[], fileArrs?: Record<string, string>[] }, isOperationStore: boolean) {
      Dialog.create({
        component: FolderDeleteDialog,
        componentProps: {
          localId,
          bucket_name: bucketName,
          dirpath: dirNames,
          isOperationStore
        }
      })
    },
    // 公开分享
    triggerPublicShareDialog (localId: string, bucketName: string, dirNames: { dirArrs?: Record<string, string>[], fileArrs?: Record<string, string>[] }, isOperationStore: boolean) {
      Dialog.create({
        component: PublicShareDialog,
        componentProps: {
          localId,
          bucket_name: bucketName,
          pathObj: dirNames,
          isOperationStore
        }
      })
    },
    // 已经分享
    triggerAlreadyShareDialog (localId: string, bucketName: string, dirNames: { dirArrs?: Record<string, string>[], fileArrs?: Record<string, string>[] }, isOperationStore: boolean, isRefresh?: boolean) {
      Dialog.create({
        component: AlreadyShareDialog,
        componentProps: {
          localId,
          bucketName,
          pathObj: dirNames,
          isOperationStore,
          isRefresh
        }
      })
    },
    // 文件重命名
    triggerChangeFolderDialog (localId: string, bucketName: string, objPath: string, dirName: string, isOperationStore: boolean) {
      Dialog.create({
        component: FileChangeNameDialog,
        componentProps: {
          localId,
          bucket_name: bucketName,
          objpath: objPath,
          dirName,
          isOperationStore
        }
      })
    },
    // 上传文件
    triggerUploadDialog (localId: string, bucketName: string, dirPath: string) {
      Dialog.create({
        component: UploadDialog,
        componentProps: {
          localId,
          bucket_name: bucketName,
          dirPath
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
    }
  }
})
