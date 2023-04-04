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
import TokenCreateDialog from 'components/bucket/TokenCreateDialog.vue'
import ChangeKeyStateDialog from 'components/bucket/ChangeKeyStateDialog.vue'
import CreateKeyDialog from 'components/bucket/CreateKeyDialog.vue'
import DeleteKeyDialog from 'components/bucket/DeleteKeyDialog.vue'
import RedeemCouponDialog from 'components/coupon/RedeemCouponDialog.vue'
import DownloadProgressDialog from 'components/bucket/DownloadProgressDialog.vue'
import MoveFileDialog from 'components/bucket/MoveFileDialog.vue'

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
* */

// 桶简介对象类型, 从vms获取
export interface BucketBriefInterface {
  id: string // 存储桶在vms中的id
  name: string // 存储桶在vms中的name， 与具体服务中一致
  creation_time: string // vms得知创建成功的时间
  user_id: string // vms中的userId
  username: string // vms中的username
  service: {
    id: string // vms中注册的serviceId
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
  user: { // 具体服务中的user
    id: number
    username: string
  },
  created_time: string // 存储桶在具体服务中创建成功的时间
  access_permission: string
  ftp_enable: boolean
  ftp_password: string
  ftp_ro_password: string
  remarks: string
}

// 完整桶对象类型，主体为brief，内含detail
export interface BucketInterface extends BucketBriefInterface {
  detail: BucketDetailInterface | null
}

/* DEPRECATED  // 桶对象类型，从具体服务获取
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
} */

// 桶统计信息对象类型
export interface BucketStatInterface {
  bucket_name: string
  stats: {
    space: number
    count: number
  }
  stats_time: string

  // bucketId
  id: string
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

  // bucketId
  id: string
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
  fileCount: number
  files: FileInterface[]
  // 自己定义的localId，来自bucketId dir_path 两者的拼接 'bucketId' or 'bucketId/path1/path2/path3...'
  localId: string
  bucketId: string
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

export interface TokenInterface {
  key: string
  user: string
  created: string
}

export interface ResKeyPairInterface {
  access_key: string
  create_time: string
  permission: string
  secret_key: string
  state: boolean
  user: string
}

export interface KeyPairInterface {
  access_key: string
  create_time: string
  permission: string
  secret_key: string
  state: boolean
  user: string
  service: string
}

export interface IntegratedServiceInterface {
  serviceId: string
  serviceName: string
  serviceNameEn: string
}

export interface IntegratedBucketInterface {
  bucketId: string
  bucketName: string
}

export interface DownloadProgressInterface {
  fileName: string,
  na: string,
  progress: number,
  loadedSize: number,
  totalSize: number,
  downSpeed: string,
  surplusTime: string,
  state: 'download' | 'wait' | 'complete' | 'cancel'
}

export interface DirPathInterface {
  Creation: string
  ETag: string
  IsObject: boolean
  Key: string
  LastModified: string
  Size: number
}

interface QueueInterface {
  fileName: string
  na: string
  state?: 'normal' | 'reload'
}

interface CancelDownloadInterface {
  na: string,
  controller: AbortController
}

interface pathPageInterface {
  page: number
  limit: number
  offset: number
}

export interface IntegratedSearchInterface {
  service: IntegratedServiceInterface,
  bucket: Array<IntegratedBucketInterface> | []
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

export interface BucketTableInterface extends partTable, idTable<BucketInterface> {
}

export interface BucketStatTableInterface extends partTable, idTable<BucketStatInterface> {
}

export interface BucketTokenSetTableInterface extends partTable, idTable<BucketTokenSetInterface> {
}

export interface PathTableInterface extends partTable, localIdTable<PathInterface> {
}

export interface KeyPairTableInterface extends totalTable, idTable<KeyPairInterface> {
}

export interface AuthTokenTableInterface extends totalTable, idTable<TokenInterface> {
}

export interface CouponTableInterface extends totalTable, idTable<CouponInterface> {
}

/* 表的具体类型 */

export const useStore = defineStore('storage', {
  state: () => ({
    items: {
      // 实时记录用户所在app局部路径位置
      // 例如'/my/server/personal/list' -> ['personal', 'list'], 供二级三级导航栏在刷新时保持选择使用
      currentPath: [] as string[],
      // 分享链接所用的服务单元信息
      shareService: {} as ServiceInterface,
      progressList: [] as DownloadProgressInterface[],
      downQueue: [] as QueueInterface[],
      waitQueue: [] as QueueInterface[],
      cancelDownloadArr: [] as CancelDownloadInterface[],
      allFolderPath: [] as string[],
      allFolderPathNew: [] as string[],
      pathPage: {
        page: 1,
        limit: 100,
        offset: 0
      } as pathPageInterface
    },
    tables: {
      serviceTable: {
        status: 'init',
        allIds: [],
        byId: {}
      } as ServiceTableInterface,
      bucketTable: {
        status: 'init',
        allIds: [],
        byId: {}
      } as BucketTableInterface,
      bucketStatTable: {
        status: 'init',
        allIds: [],
        byId: {}
      } as BucketStatTableInterface,
      bucketTokenTable: {
        status: 'init',
        allIds: [],
        byId: {}
      } as BucketTokenSetTableInterface,
      pathTable: {
        status: 'init',
        allLocalIds: [],
        byLocalId: {}
      } as PathTableInterface,
      keyPairTable: {
        status: 'init',
        allIds: [],
        byId: {}
      } as KeyPairTableInterface,
      authTokenTable: {
        status: 'init',
        allIds: [],
        byId: {}
      } as AuthTokenTableInterface,
      couponTable: {
        status: 'init',
        allIds: [],
        byId: {}
      } as CouponTableInterface
    }
  }),
  getters: {
    // 获取服务单元选项
    getServiceOptions: state => {
      return state.tables.serviceTable.allIds.map(serviceId => {
        const currentService = state.tables.serviceTable.byId[serviceId]
        return {
          value: currentService?.id,
          label: currentService?.name,
          labelEn: currentService?.name_en
        }
      })
    },
    // 获取所有文件夹路径
    // getAllDirPath: (state) => (type: string): string[] => {
    //   console.log('23123', type)
    //   if (type === 'all') {
    //     return state.items.allFolderPath.map(serviceId => {
    //       return serviceId.Key
    //     })
    //   } else {
    //     return ['1111', '22222']
    //   }
    // },
    // 获取全部服务单元选项
    getAllServiceOptions: state => {
      const services = (state.tables.serviceTable.allIds).map(serviceId => {
        const currentService = state.tables.serviceTable.byId[serviceId]
        return {
          value: currentService?.id,
          label: currentService?.name,
          labelEn: currentService?.name_en
        }
      })
      services.unshift({
        value: 'all',
        label: '全部服务单元',
        labelEn: 'All Service Units'
      })
      return services
    },
    getIntegratedSearchOptions (state): IntegratedSearchInterface[] {
      const IntegratedArr = []
      // 先找到每个服务
      for (const service of state.tables.serviceTable.allIds) {
        const IntegratedObj: { service: IntegratedServiceInterface, bucket: IntegratedBucketInterface[] } = {
          // 对象检索页面需要的数据结构
          // service用于存放服务
          service: {
            serviceId: '',
            serviceName: '',
            serviceNameEn: ''
          },
          // bucket用于存放该服务下的存储桶
          bucket: []
        }
        // 需要服务id以及服务名
        IntegratedObj.service.serviceId = service
        IntegratedObj.service.serviceName = state.tables.serviceTable.byId[service]?.name
        IntegratedObj.service.serviceNameEn = state.tables.serviceTable.byId[service]?.name_en
        // 遍历所有桶
        for (const bucket of state.tables.bucketTable.allIds) {
          const bucketObj = {
            bucketId: '',
            bucketName: ''
          }
          // 找到属于某一个服务的存储桶 存到某一服务下
          if (state.tables.bucketTable.byId[bucket]?.service.id === service) {
            // bucketId和桶名
            bucketObj.bucketId = bucket
            bucketObj.bucketName = state.tables.bucketTable.byId[bucket]?.name
            IntegratedObj.bucket.push(bucketObj)
          }
        }
        IntegratedArr.push(IntegratedObj)
      }
      return IntegratedArr
    },
    getKeyPairTable: (state) => (service: string): KeyPairInterface[] => {
      const sortFn = (a: KeyPairInterface, b: KeyPairInterface) => new Date(b.create_time).getTime() - new Date(a.create_time).getTime()
      const keyPairs: KeyPairInterface[] = []
      for (const key of Object.values(state.tables.keyPairTable.byId)) {
        if (key.service === service) {
          keyPairs.push(key)
        }
      }
      return keyPairs.sort(sortFn)
    },
    getTokenTable: (state) => (service: string): TokenInterface[] => {
      const tokens: TokenInterface[] = []
      if (state.tables.authTokenTable.byId[service]) {
        tokens.push(state.tables.authTokenTable.byId[service])
      }
      return tokens
    },
    // 根据用户选择的serviceId来返回coupon数组
    getCouponsByServiceId: (state) => (serviceId: string): CouponInterface[] => {
      // 排序函数，根据coupon创建时间降序排列
      const sortFn = (a: CouponInterface, b: CouponInterface) => new Date(b.creation_time).getTime() - new Date(a.creation_time).getTime()

      if (serviceId === '0') {
        return Object.values(state.tables.couponTable.byId).sort(sortFn)
      } else {
        const rows: CouponInterface[] = []
        for (const coupon of Object.values(state.tables.couponTable.byId)) {
          if (coupon?.app_service?.service_id === serviceId) {
            rows.push(coupon)
          }
        }
        return rows.sort(sortFn)
      }
    }
  },
  actions: {
    // loadAllItems () {},
    async loadAllTables () {
      if (this.tables.serviceTable.status === 'init') {
        // 加载serviceTable
        void await this.loadServiceTable()
        if (this.tables.bucketTable.status === 'init') {
          // 加载bucketTable
          void await this.loadBucketTable()
        }
        // 加载couponTable
        void await this.loadCouponTable()
      }
    },
    // 加载分享页面需要的table
    async loadShareAllTables () {
      if (this.tables.serviceTable.status === 'init') {
        // 加载serviceTable
        void await this.loadServiceTable()
        if (this.tables.bucketTable.status === 'init') {
          // 加载bucketTable
          void await this.loadBucketTable()
        }
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
          this.tables.serviceTable.allIds.unshift(Object.keys(normalizedData.entities.service as Record<string, unknown>)[0])
          this.tables.serviceTable.allIds = [...new Set(this.tables.serviceTable.allIds)]
        })
        this.tables.serviceTable.status = 'total'
      } catch (exception) {
        exceptionNotifier(exception)
        this.tables.serviceTable.status = 'error'
      }
    },
    // 读取全部服务单元的存储桶，条目在vms取，detail字段在各个服务单元的api取
    async loadBucketTable () {
      // status
      this.tables.bucketTable.status = 'loading'
      // clear table
      this.tables.bucketTable.allIds = []
      this.tables.bucketTable.byId = {}
      // requests
      try {
        // 在vms获取桶的大致信息
        const respVmsBucketList = await api.vms.storage.getStorageBucket({
          query: {
            page_size: 99999
          }
        })
        for (const bucketBrief of respVmsBucketList.data.results) {
          try {
            // 去具体服务单元请求bucket具体信息
            const base = this.tables.serviceTable.byId[bucketBrief.service.id]?.endpoint_url
            const respGetBuckets = await api.storage.single.getBucketsIdOrName({
              base,
              path: { id_or_name: bucketBrief.name },
              query: { 'by-name': true }
            })
            // 保存对象detail字段
            Object.assign(this.tables.bucketTable.byId, {
              [bucketBrief.id]: Object.assign(bucketBrief, {
                detail: respGetBuckets.data.bucket
              })
            })
          } catch (exception) {
            // 没获取到则是该桶可能被具体服务单元删除了
            exceptionNotifier(exception)
            // 保存对象detail字段为null
            Object.assign(this.tables.bucketTable.byId, {
              [bucketBrief.id]: Object.assign(bucketBrief, {
                detail: null
              })
            })
          }
          // 无论是否拿到detail，都是bucket table的一部分，id都应记录
          this.tables.bucketTable.allIds.unshift(bucketBrief.id)
          this.tables.bucketTable.allIds = [...new Set(this.tables.bucketTable.allIds)]
        }
        this.tables.bucketTable.status = 'part'
      } catch (exception) {
        exceptionNotifier(exception)
        this.tables.bucketTable.status = 'error'
      }
    },
    // bucketTable应从vms读取，是粗略的信息
    // async addBucketTable (serviceId: string) {
    //   const base = this.tables.serviceTable.byId[serviceId]?.endpoint_url
    //   // 1. status改为loading
    //   this.tables.bucketTable.status = 'loading'
    //   try {
    //     // 2. 发送网络请求，格式化数据，保存对象
    //     const respGetBuckets = await api.storage.single.getBuckets({ base })
    //     for (const bucket of respGetBuckets.data.buckets) {
    //       Object.assign(this.tables.bucketTable.byLocalId, {
    //         [serviceId + '/' + bucket.name]: Object.assign(bucket, {
    //           local_id: bucket.name,
    //           service_id: serviceId
    //         })
    //       })
    //       // this.tables.bucketTable.allLocalIds.unshift(Object.keys({ [serviceId + '/' + bucket.name]: Object.assign(bucket, { local_id: serviceId + '/' + bucket.name }) })[0])
    //       this.tables.bucketTable.allLocalIds.unshift(serviceId + '/' + bucket.name)
    //       this.tables.bucketTable.allLocalIds = [...new Set(this.tables.bucketTable.allLocalIds)]
    //     }
    //     // 3. status改为total
    //     this.tables.bucketTable.status = 'part'
    //   } catch (exception) {
    //     exceptionNotifier(exception)
    //     this.tables.bucketTable.status = 'error'
    //   }
    // },
    // bucketStatTable: 累积加载，localId
    async addBucketStatTable (bucketId: string) {
      const bucket = this.tables.bucketTable.byId[bucketId]
      const base = this.tables.serviceTable.byId[bucket.service.id]?.endpoint_url
      // 1. status改为loading
      this.tables.bucketStatTable.status = 'loading'
      try {
        // 2. 发送网络请求，格式化数据，保存对象
        const respGetStatsBucket = await api.storage.single.getStatsBucket({
          base,
          path: { bucket_name: bucket.name }
        })
        const item = {
          [bucket.id]: {
            id: bucket.id,
            bucket_name: respGetStatsBucket.data.bucket_name,
            stats: respGetStatsBucket.data.stats,
            stats_time: respGetStatsBucket.data.stats_time
          }
        }
        Object.assign(this.tables.bucketStatTable.byId, item)
        this.tables.bucketStatTable.allIds.unshift(bucket.id)
        this.tables.bucketStatTable.allIds = [...new Set(this.tables.bucketStatTable.allIds)]
        // 3. status改为part
        this.tables.bucketStatTable.status = 'part'
      } catch (exception) {
        exceptionNotifier(exception)
        this.tables.bucketStatTable.status = 'error'
      }
    },
    // bucketTokenTable: 累积加载，bucketId
    async addBucketTokenTable (bucketId: string) {
      const bucket = this.tables.bucketTable.byId[bucketId]
      const base = this.tables.serviceTable.byId[bucket.service.id]?.endpoint_url
      // 1. status改为loading
      this.tables.bucketTokenTable.status = 'loading'
      try {
        // 2. 发送网络请求，格式化数据，保存对象
        const respGetBucketTokenList = await api.storage.single.getBucketsIdOrNameTokenList({
          base,
          query: { 'by-name': true },
          path: { id_or_name: bucket.name }
        })
        const item = {
          [bucket.id]: {
            id: bucket.id,
            bucket_name: bucket.name,
            tokens: respGetBucketTokenList.data.tokens
          }
        }
        Object.assign(this.tables.bucketTokenTable.byId, item)
        this.tables.bucketTokenTable.allIds.unshift(bucket.id)
        this.tables.bucketTokenTable.allIds = [...new Set(this.tables.bucketTokenTable.allIds)]
        // 3. status改为part
        this.tables.bucketTokenTable.status = 'part'
      } catch (exception) {
        exceptionNotifier(exception)
        this.tables.bucketTokenTable.status = 'error'
      }
    },
    // PathTable: 累积加载，localId (bucketId/path1/path2)
    async addPathTable (bucketId: string, path?: string, limit?: number, offset?: number) {
      const bucket = this.tables.bucketTable.byId[bucketId]
      const base = this.tables.serviceTable.byId[bucket.service.id]?.endpoint_url
      // 1. status改为loading
      this.tables.pathTable.status = 'loading'
      try {
        // 2. 判断是桶根目录还是次级目录，判断是否已经有了: 没有发送网络请求，格式化数据，保存对象
        // const currentPath = payload.bucket + (payload.path ? ('/' + payload.path) : '')
        // if (!context.state.tables.pathTable.allLocalIds.includes(currentPath)) {
        if (!path) { // 桶的根目录
          const respGetDirBucket = await api.storage.single.getDirBucketName({
            base,
            query: { limit, offset },
            path: { bucket_name: bucket.name }
          })
          const item = {
            [bucket.id]: Object.assign({}, {
              bucketId: bucket.id,
              localId: bucket.id,
              bucket_name: respGetDirBucket.data.bucket_name,
              dir_path: respGetDirBucket.data.dir_path,
              fileCount: respGetDirBucket.data.count,
              files: respGetDirBucket.data.files
            })
          }
          Object.assign(this.tables.pathTable.byLocalId, item)
          this.tables.pathTable.allLocalIds.unshift(bucket.id)
          this.tables.pathTable.allLocalIds = [...new Set(this.tables.pathTable.allLocalIds)]
        } else { // 次级目录
          const respGetDirPath = await api.storage.single.getDirBucketNameDirPath({
            base,
            query: {
              limit,
              offset
            },
            path: {
              bucket_name: bucket.name,
              dirpath: path
            }
          })
          const item = {
            [bucket.id + '/' + path]: Object.assign({}, {
              bucketId: bucket.id,
              localId: bucket.id + '/' + respGetDirPath.data.dir_path,
              bucket_name: respGetDirPath.data.bucket_name,
              dir_path: respGetDirPath.data.dir_path,
              fileCount: respGetDirPath.data.count,
              files: respGetDirPath.data.files
            })
          }
          Object.assign(this.tables.pathTable.byLocalId, item)
          // this.tables.pathTable.allLocalIds.unshift(Object.keys(item)[0])
          this.tables.pathTable.allLocalIds.unshift(bucket.id + '/' + path)
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
    async addFilePath (bucketId: string) {
      const bucket = this.tables.bucketTable.byId[bucketId]
      const base = this.tables.serviceTable.byId[bucket.service.id]?.endpoint_url
      const respGetListBucket = await api.storage.single.getListBucket({ base, path: { bucket_name: bucket.name } })
      const filterDirData = respGetListBucket.data.Contents.filter((path: DirPathInterface) => !path.IsObject)
      const dirItemArr = filterDirData.map((dir: DirPathInterface) => {
        return dir.Key
      })
      this.items.allFolderPath = dirItemArr
    },
    // async addFile (data: FileInterface[], bucketId: string) {
    //   console.log(data)
    //   const bucket = this.tables.bucketTable.byId[bucketId]
    //   const base = this.tables.serviceTable.byId[bucket.service.id]?.endpoint_url
    //   for (const data1Element of data) {
    //     this.items.allFolderPathNew.push(data1Element.na)
    //     const respGetDirPath = await api.storage.single.getDirBucketNameDirPath({
    //       base,
    //       query: {
    //         limit: 100,
    //         offset: 0
    //       },
    //       path: {
    //         bucket_name: bucket.name,
    //         dirpath: data1Element.na
    //       }
    //     })
    //     if (respGetDirPath.data.files.length > 0) {
    //       const data2 = respGetDirPath.data.files.filter((item: FileInterface) => !item.fod)
    //       await this.addFile(data2, bucketId)
    //     }
    //   }
    // },
    // async addFilePathNew (bucketId: string) {
    //   this.items.allFolderPathNew = []
    //   const bucket = this.tables.bucketTable.byId[bucketId]
    //   const base = this.tables.serviceTable.byId[bucket.service.id]?.endpoint_url
    //   const respGetDirBucket = await api.storage.single.getDirBucketName({
    //     base,
    //     query: { limit: 100, offset: 0 },
    //     path: { bucket_name: bucket.name }
    //   })
    //   const data1 = respGetDirBucket.data.files.filter((item: FileInterface) => !item.fod)
    //   await this.addFile(data1, bucketId)
    //   console.log(this.items.allFolderPathNew)
    // },
    async loadTokenTable () {
      this.tables.authTokenTable.status = 'loading'
      for (const service of this.tables.serviceTable.allIds) {
        const respGetToken = await api.storage.storage.getAuthToken({ base: this.tables.serviceTable.byId[service].endpoint_url })
        this.tables.authTokenTable.allIds.unshift(service)
        Object.assign(this.tables.authTokenTable.byId, {
          [service]: respGetToken.data.token
        })
        this.tables.authTokenTable.allIds = [...new Set(this.tables.authTokenTable.allIds)]
      }
      this.tables.authTokenTable.status = 'total'
    },
    async loadKeyTable () {
      this.tables.keyPairTable.status = 'loading'
      for (const service of this.tables.serviceTable.allIds) {
        try {
          const respGetKeys = await api.storage.storage.getAuthKey({ base: this.tables.serviceTable.byId[service].endpoint_url })
          respGetKeys.data.keys.forEach((key: ResKeyPairInterface) => {
            const keyObj = {
              access_key: '',
              create_time: '',
              permission: '',
              secret_key: '',
              state: false,
              user: '',
              service: ''
            }
            keyObj.access_key = key.access_key
            keyObj.create_time = key.create_time
            keyObj.permission = key.permission
            keyObj.secret_key = key.secret_key
            keyObj.state = key.state
            keyObj.user = key.user
            keyObj.service = service
            Object.assign(this.tables.keyPairTable.byId, {
              [key.access_key]: keyObj
            })
            this.tables.keyPairTable.allIds.unshift(key.access_key)
            this.tables.keyPairTable.allIds = [...new Set(this.tables.keyPairTable.allIds)]
          })
        } catch (exception) {
          exceptionNotifier(exception)
          this.tables.keyPairTable.status = 'error'
        }
      }
      this.tables.keyPairTable.status = 'total'
    },
    async loadCouponTable () {
      // 先清空table，避免多次更新时数据累加（凡是需要强制刷新的table，都要先清空再更新）
      this.tables.couponTable = {
        byId: {},
        allIds: [],
        status: 'init'
      }
      this.tables.couponTable.status = 'loading'
      try {
        // 发送请求,列举全部personal coupon
        const respCoupon = await api.vms.cashcoupon.getCashCoupon({
          query: {
            page_size: 9999,
            app_service_category: 'vms-object'
          }
        })
        // 将响应normalize，存入state里的couponTable
        const coupon = new schema.Entity('coupon')
        for (const data of respCoupon.data.results) {
          const normalizedData = normalize(data, coupon)
          Object.assign(this.tables.couponTable.byId, normalizedData.entities.coupon)
          this.tables.couponTable.allIds.unshift(Object.keys(normalizedData.entities.coupon as Record<string, unknown>)[0])
          this.tables.couponTable.allIds = [...new Set(this.tables.couponTable.allIds)]
        }
        this.tables.couponTable.status = 'total'
      } catch (exception) {
        exceptionNotifier(exception)
        this.tables.couponTable.status = 'error'
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
    async toggleBucketAccess (bucketId: string) {
      const bucket = this.tables.bucketTable.byId[bucketId]
      const base = this.tables.serviceTable.byId[bucket.service.id]?.endpoint_url
      this.tables.bucketTable.status = 'loading'
      try {
        const respPatchAccess = await api.storage.single.patchBucketsIdOrName({
          base,
          path: { id_or_name: bucket.name },
          query: {
            'by-name': true,
            public: bucket.detail?.access_permission === '私有' ? 1 : 2
          }
        })
        // bucket.detail?.access_permission = respPatchAccess.data.public === 1 ? '公有' : '私有'
        if (bucket.detail !== null) {
          Object.assign(bucket.detail, { access_permission: respPatchAccess.data.public === 1 ? '公有' : '私有' })
        }
        this.tables.bucketTable.status = 'part'
      } catch (exception) {
        this.tables.bucketTable.status = 'error'
        exceptionNotifier(exception)
      }
    },
    // 切换存储桶FTP状态
    async toggleBucketFtp (bucketId: string) {
      const bucket = this.tables.bucketTable.byId[bucketId]
      const base = this.tables.serviceTable.byId[bucket.service.id]?.endpoint_url
      this.tables.bucketTable.status = 'loading'
      try {
        const respPatchFtp = await api.storage.single.patchFtpBucketName({
          base,
          path: { bucket_name: bucket.name },
          query: {
            enable: !bucket.detail?.ftp_enable
          }
        })
        // bucket.detail.ftp_enable = respPatchFtp.data.data.enable
        if (bucket.detail !== null) {
          Object.assign(bucket.detail, { ftp_enable: respPatchFtp.data.data.enable })
        }
        this.tables.bucketTable.status = 'part'
      } catch (exception) {
        this.tables.bucketTable.status = 'error'
        exceptionNotifier(exception)
      }
    },
    // 存储下载进度条
    async storageProgressList (payload: { progressData: DownloadProgressInterface, itemIndex: number }) {
      this.items.progressList[payload.itemIndex] = payload.progressData
    },
    /* dialogs */
    // 触发新建存储桶对话框
    triggerCreateBucketDialog () {
      Dialog.create({
        component: BucketCreateDialog
      })
    },
    // 触发删除存储桶对话框
    triggerDeleteBucketDialog (buckets: BucketInterface[]) {
      Dialog.create({
        component: BucketDeleteDialog,
        componentProps: {
          buckets
        }
      })
    },
    // 新建文件夹
    triggerCreateFolderDialog (bucketId: string, localId: string, bucketName: string, dirPath: string) {
      Dialog.create({
        component: FolderCreateDialog,
        componentProps: {
          bucketId,
          localId,
          bucketName,
          dirPath
        }
      })
    },
    // 上传文件
    triggerUploadDialog (bucketId: string, localId: string, bucketName: string, dirPath: string) {
      Dialog.create({
        component: UploadDialog,
        componentProps: {
          bucketId,
          localId,
          bucket_name: bucketName,
          dirPath
        }
      })
    },
    // 删除文件夹
    triggerDeleteFolderDialog (bucketId: string, localId: string, bucketName: string, dirNames: { dirArrs?: Record<string, string>[], fileArrs?: Record<string, string>[] }, isOperationStore: boolean) {
      Dialog.create({
        component: FolderDeleteDialog,
        componentProps: {
          bucketId,
          localId,
          bucket_name: bucketName,
          dirpath: dirNames,
          isOperationStore
        }
      })
    },
    // 公开分享
    triggerPublicShareDialog (bucketId: string, localId: string, bucketName: string, dirNames: { dirArrs?: Record<string, string>[], fileArrs?: Record<string, string>[] }, isOperationStore: boolean) {
      Dialog.create({
        component: PublicShareDialog,
        componentProps: {
          bucketId,
          localId,
          bucket_name: bucketName,
          pathObj: dirNames,
          isOperationStore
        }
      })
    },
    // 已经分享
    triggerAlreadyShareDialog (bucketId: string, localId: string, bucketName: string, dirNames: { dirArrs?: Record<string, string>[], fileArrs?: Record<string, string>[] }, isOperationStore: boolean, isRefresh?: boolean) {
      Dialog.create({
        component: AlreadyShareDialog,
        componentProps: {
          bucketId,
          localId,
          bucketName,
          pathObj: dirNames,
          isOperationStore,
          isRefresh
        }
      })
    },
    // 文件重命名
    triggerChangeFolderDialog (bucketId: string, localId: string, bucketName: string, objPath: string, dirName: string, isOperationStore: boolean) {
      Dialog.create({
        component: FileChangeNameDialog,
        componentProps: {
          bucketId,
          localId,
          bucket_name: bucketName,
          objpath: objPath,
          dirName,
          isOperationStore
        }
      })
    },
    // 文件移动
    triggerMoveFileDialog (bucketId: string, localId: string, bucketName: string, objPath: string, isOperationStore: boolean) {
      Dialog.create({
        component: MoveFileDialog,
        componentProps: {
          bucketId,
          localId,
          bucket_name: bucketName,
          objpath: objPath,
          isOperationStore
        }
      })
    },
    // 修改存储桶ftp密码
    triggerEditBucketFtpPasswordDialog (bucketId: string, isRo: boolean) {
      Dialog.create({
        component: BucketFtpPasswordEditDialog,
        componentProps: {
          bucketId,
          isRo
        }
      })
    },
    // 修改存储桶备注
    triggerEditBucketNoteDialog (bucketId: string) {
      Dialog.create({
        component: BucketNoteEditDialog,
        componentProps: {
          bucketId
        }
      })
    },
    // 创建存储桶token
    triggerAddBucketTokenDialog (bucketId: string) {
      Dialog.create({
        component: BucketTokenAddDialog,
        componentProps: {
          bucketId
        }
      })
    },
    // 删除存储桶的token
    triggerDeleteBucketTokenDialog (bucketId: string, tokenKey: string) {
      Dialog.create({
        component: BucketTokenDeleteDialog,
        componentProps: {
          bucketId,
          tokenKey
        }
      })
    },
    // 触发新建token对话框
    triggerCreateTokenDialog (serviceId: string) {
      Dialog.create({
        component: TokenCreateDialog,
        componentProps: {
          serviceId
        }
      })
    },
    // 触发新建访问密匙对话框
    triggerCreateKeyDialog (serviceId: string) {
      Dialog.create({
        component: CreateKeyDialog,
        componentProps: {
          serviceId
        }
      })
    },
    // 触发删除访问密匙对话框
    triggerDeleteKeyDialog (serviceId: string, accessKey: string) {
      Dialog.create({
        component: DeleteKeyDialog,
        componentProps: {
          serviceId,
          accessKey
        }
      })
    },
    // 触发新建token对话框
    triggerChangeKeyStateDialog (serviceId: string, accessKey: string, state: string) {
      Dialog.create({
        component: ChangeKeyStateDialog,
        componentProps: {
          serviceId,
          accessKey,
          state
        }
      })
    },
    // 触发下载进度条对话框
    triggerDownloadProgressDialog () {
      Dialog.create({
        component: DownloadProgressDialog
      })
    },
    /* coupon */
    redeemCouponDialog () {
      Dialog.create({
        component: RedeemCouponDialog
      })
    }
  }
})
