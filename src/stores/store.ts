import { defineStore } from 'pinia'
import storage from 'src/api/index'
import { Dialog } from 'quasar'

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

// 桶对象类型
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

  // 自己定义的localId:  应取name字段
  localId: string
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

  // 自己定义的localId，来自bucket_name 和 dir_path的拼接: ’bucketName‘ or ’bucketName/path1/path2/path3...‘
  localId: string
}
// localId
export interface localIdTable<T> {
  allLocalIds: string[]
  byLocalId: Record<string, T>
}
export interface totalTable {
  status: 'empty' | 'loading' | 'total' | 'part'
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

export interface BucketTableInterface extends totalTable, localIdTable<BucketInterface> {
}
export interface BucketStatTableInterface extends totalTable, localIdTable<BucketStatInterface> {
}
export interface BucketTokenSetTableInterface extends totalTable, localIdTable<BucketTokenSetInterface> {
}
export interface PathTableInterface extends totalTable, localIdTable<PathInterface> {
}

export const useStore = defineStore('storage', {
  state: () => ({
    items: {
      // 实时记录用户所在app局部路径位置
      // 例如'/my/server/personal/list' -> ['personal', 'list'], 供二级三级导航栏在刷新时保持选择使用
      currentPath: [] as string[]
    },
    tables: {
      bucketTable: {
        status: 'empty',
        allLocalIds: [],
        byLocalId: {}
      } as BucketTableInterface,
      bucketStatTable: {
        status: 'empty',
        allLocalIds: [],
        byLocalId: {}
      } as BucketStatTableInterface,
      bucketTokenTable: {
        status: 'empty',
        allLocalIds: [],
        byLocalId: {}
      } as BucketTokenSetTableInterface,
      pathTable: {
        status: 'empty',
        allLocalIds: [],
        byLocalId: {}
      } as PathTableInterface
    }
  }),
  getters: {
    getBuckets (state): string[] {
      let bucketOptions = []
      bucketOptions = state.tables.bucketTable.allLocalIds
      return bucketOptions
    }
  },
  actions: {
    async loadBucketTable () {
      // 1. 先清空table内容
      this.tables.bucketTable = {
        byLocalId: {},
        allLocalIds: [],
        status: 'empty'
      }
      // 2. status改为loading
      this.tables.bucketTable.status = 'loading'
      // 3. 发送网络请求，格式化数据，保存对象
      const respGetBuckets = await storage.storage.api.getBuckets()
      for (const bucket of respGetBuckets.data.buckets) {
        Object.assign(this.tables.bucketTable.byLocalId, { [bucket.name]: Object.assign(bucket, { localId: bucket.name }) })
        this.tables.bucketTable.allLocalIds.unshift(Object.keys({ [bucket.name]: Object.assign(bucket, { localId: bucket.name }) })[0])
        this.tables.bucketTable.allLocalIds = [...new Set(this.tables.bucketTable.allLocalIds)]
      }
      // 4. status改为total
      this.tables.bucketTable.status = 'total'
    },
    // bucketStatTable: 累积加载，localId
    async addBucketStatTable (payload: { bucket: string }) {
      // 1. status改为loading
      this.tables.bucketStatTable.status = 'loading'
      // 2. 发送网络请求，格式化数据，保存对象
      const respGetStatsBucket = await storage.storage.api.getStatsBucket({ path: { bucket_name: payload.bucket } })
      const item = {
        [payload.bucket]: Object.assign({}, {
          localId: respGetStatsBucket.data.bucket_name,
          bucket_name: respGetStatsBucket.data.bucket_name,
          stats: respGetStatsBucket.data.stats,
          stats_time: respGetStatsBucket.data.stats_time
        })
      }
      Object.assign(this.tables.bucketStatTable.byLocalId, item)
      this.tables.bucketStatTable.allLocalIds.unshift(Object.keys(item)[0])
      this.tables.bucketStatTable.allLocalIds = [...new Set(this.tables.bucketStatTable.allLocalIds)]
      // 3. status改为part
      this.tables.bucketTable.status = 'part'
    },
    // bucketTokenTable: 累积加载，localId
    async addBucketTokenTable (payload: { bucket: string }) {
      // 1. status改为loading
      this.tables.bucketTokenTable.status = 'loading'
      // 2. 发送网络请求，格式化数据，保存对象
      const respGetBucketTokenList = await storage.storage.api.getBucketsIdOrNameTokenList({
        query: { 'by-name': true },
        path: { id_or_name: payload.bucket }
      })
      const item = {
        [payload.bucket]: Object.assign({}, {
          localId: payload.bucket,
          bucket_name: payload.bucket,
          tokens: respGetBucketTokenList.data.tokens
        })
      }
      Object.assign(this.tables.bucketTokenTable.byLocalId, item)
      this.tables.bucketTokenTable.allLocalIds.unshift(Object.keys(item)[0])
      this.tables.bucketTokenTable.allLocalIds = [...new Set(this.tables.bucketTokenTable.allLocalIds)]
      // 3. status改为part
      this.tables.bucketTokenTable.status = 'part'
    },
    // PathTable: 累积加载，localId (bucketName/path1/path2)
    async addPathTable (payload: { bucket: string, path?: string }) {
      // 1. status改为loading
      this.tables.pathTable = {
        byLocalId: {},
        allLocalIds: [],
        status: 'loading'
      }
      // 2. 判断是桶根目录还是次级目录，判断是否已经有了: 没有发送网络请求，格式化数据，保存对象
      // const currentPath = payload.bucket + (payload.path ? ('/' + payload.path) : '')
      // if (!context.state.tables.pathTable.allLocalIds.includes(currentPath)) {
      if (!payload.path) { // 桶的根目录
        const respGetDirBucket = await storage.storage.api.getDirBucketName({ path: { bucket_name: payload.bucket } })
        const item = {
          [payload.bucket]: Object.assign({}, {
            localId: respGetDirBucket.data.bucket_name,
            bucket_name: respGetDirBucket.data.bucket_name,
            dir_path: respGetDirBucket.data.dir_path,
            files: respGetDirBucket.data.files
          })
        }
        Object.assign(this.tables.pathTable.byLocalId, item)
        this.tables.pathTable.allLocalIds.unshift(Object.keys(item)[0])
        this.tables.pathTable.allLocalIds = [...new Set(this.tables.pathTable.allLocalIds)]
      } else { // 次级目录
        const respGetDirPath = await storage.storage.api.getDirBucketNameDirPath({
          path: {
            bucket_name: payload.bucket,
            dirpath: payload.path
          }
        })
        const item = {
          [payload.bucket + '/' + payload.path]: Object.assign({}, {
            localId: respGetDirPath.data.bucket_name + '/' + respGetDirPath.data.dir_path,
            bucket_name: respGetDirPath.data.bucket_name,
            dir_path: respGetDirPath.data.dir_path,
            files: respGetDirPath.data.files
          })
        }
        Object.assign(this.tables.pathTable.byLocalId, item)
        this.tables.pathTable.allLocalIds.unshift(Object.keys(item)[0])
        this.tables.pathTable.allLocalIds = [...new Set(this.tables.pathTable.allLocalIds)]
      }
      // }
      // 3. status改为part
      this.tables.pathTable.status = 'part'
    },
    // 新建桶
    async storeBucket (payload: { table: BucketTableInterface, item: Record<string, string> }) {
      Object.assign(this.tables.bucketTable.byLocalId, payload.item)
      this.tables.bucketTable.allLocalIds.unshift(Object.keys(payload.item)[0])
      this.tables.bucketTable.allLocalIds = [...new Set(this.tables.bucketTable.allLocalIds)]
    },
    // 删除桶
    async deleteBucket (payload: { id: string }) {
      this.tables.bucketTable.allLocalIds = this.tables.bucketTable.allLocalIds.filter((id: string) => id !== payload.id)
      delete this.tables.bucketTable.byLocalId[payload.id]
    },
    // 修改读写只读密码
    async storeFtpPassword (payload: { id: string, field: string, value: string }) {
      if (payload.field === 'ftp_password') {
        this.tables.bucketTable.byLocalId[payload.id].ftp_password = payload.value
      } else if (payload.field === 'ftp_ro_password') {
        this.tables.bucketTable.byLocalId[payload.id].ftp_ro_password = payload.value
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
    deleteFile (payload: { item: deleteInterface }) {
      if (payload.item.dirpath.dirArrs.length > 0) {
        this.tables.pathTable.byLocalId[payload.item.bucket_name].files = this.tables.pathTable.byLocalId[payload.item.bucket_name].files.filter((item) => !payload.item.dirpath.dirArrs.includes(item.name))
      }
      if (payload.item.dirpath.fileArrs.length > 0) {
        this.tables.pathTable.byLocalId[payload.item.bucket_name].files = this.tables.pathTable.byLocalId[payload.item.bucket_name].files.filter((item) => !payload.item.dirpath.fileArrs.includes(item.name))
      }
    },
    /* dialogs */
    triggerCreateBucketDialog () {
      Dialog.create({
        component: BucketCreateDialog
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
    triggerDeleteFolderDialog (payload: { localId: string, dirNames: { dirArrs?: string[], fileArrs?: string[] }}) {
      Dialog.create({
        component: FolderDeleteDialog,
        componentProps: {
          bucket_name: payload.localId,
          dirpath: payload.dirNames
        }
      })
    },
    // 文件重命名
    triggerChangeFolderDialog (payload: { localId: string, dirName: string }) {
      Dialog.create({
        component: FileChangeNameDialog,
        componentProps: {
          bucket_name: payload.localId,
          objpath: payload.dirName
        }
      })
    },
    // 公开分享
    triggerPublicShareDialog (payload: { localId: string, dirNames: { dirArrs?: string[], fileArrs?: string[] } }) {
      Dialog.create({
        component: PublicShareDialog,
        componentProps: {
          bucket_name: payload.localId,
          pathObj: payload.dirNames
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
    // 上传文件
    triggerUploadDialog (payload: { bucket_name: string }) {
      Dialog.create({
        component: UploadDialog,
        componentProps: {
          bucket_name: payload.bucket_name
        }
      })
    },
    triggerDeleteBucketDialog (payload: { bucketNames: string[] }) {
      Dialog.create({
        component: BucketDeleteDialog,
        componentProps: {
          bucketNames: payload.bucketNames
        }
      })
    },
    triggerEditBucketFtpPasswordDialog (payload: { bucketName: string, isRo: boolean }) {
      Dialog.create({
        component: BucketFtpPasswordEditDialog,
        componentProps: {
          bucketName: payload.bucketName,
          isRo: payload.isRo
        }
      })
    },
    triggerEditBucketNoteDialog (payload: { bucketName: string }) {
      Dialog.create({
        component: BucketNoteEditDialog,
        componentProps: {
          bucketName: payload.bucketName
        }
      })
    },
    triggerAddBucketTokenDialog (payload: { bucketName: string }) {
      Dialog.create({
        component: BucketTokenAddDialog,
        componentProps: {
          bucketName: payload.bucketName
        }
      })
    },
    triggerDeleteBucketTokenDialog (payload: { bucketName: string, token: string }) {
      Dialog.create({
        component: BucketTokenDeleteDialog,
        componentProps: {
          bucketName: payload.bucketName,
          token: payload.token
        }
      })
    },
    async toggleBucketAccess (payload: { bucketName: string }) {
      const respPatchAccess = await storage.storage.api.patchBucketsIdOrName({
        path: { id_or_name: payload.bucketName },
        query: {
          'by-name': true,
          public: this.tables.bucketTable.byLocalId[payload.bucketName]?.access_permission === '私有' ? 1 : 2
        }
      })
      if (respPatchAccess.data.code === 200) {
        this.tables.bucketTable.byLocalId[payload.bucketName].access_permission = respPatchAccess.data.public === 1 ? '公有' : '私有'
      }
    },
    async toggleBucketFtp (payload: { bucketName: string }) {
      const respPatchFtp = await storage.storage.api.patchFtpBucketName({
        path: { bucket_name: payload.bucketName },
        query: {
          enable: this.tables.bucketTable.byLocalId[payload.bucketName]?.ftp_enable !== true
        }
      })
      if (respPatchFtp.data.code === 200) {
        this.tables.bucketTable.byLocalId[payload.bucketName].ftp_enable = respPatchFtp.data.data.enable
      }
    }
  }
})
