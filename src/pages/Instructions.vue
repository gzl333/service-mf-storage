<script setup lang="ts">
import { ref } from 'vue'
// import { navigateToUrl } from 'single-spa'
// import { useStore } from 'stores/store'
// import { useRoute, useRouter } from 'vue-router'
import { i18n } from 'boot/i18n'

// const props = defineProps({
//   foo: {
//     type: String,
//     required: false,
//     default: ''
//   }
// })
// const emits = defineEmits(['change', 'delete'])

// const store = useStore()
// const route = useRoute()
// const router = useRouter()
const { tc } = i18n.global

const activeItem = ref('ftp') // keep selection when reloading
const changeTab = (name: string) => {
  activeItem.value = name
}
const goPage = (url: string) => {
  window.open(url)
}
</script>

<template>
  <div class="Instructions">
    <div class="text-h6 q-px-none">{{tc('使用说明')}}</div>
    <q-tabs
      v-model="activeItem"
      inline-label
      align="left"
      indicator-color="primary"
      active-color="primary"
    >
      <q-tab no-caps name="ftp" class="q-px-none q-py-md q-mr-md" icon="las la-comment" :label="tc('FTP访问说明')"
             @click="changeTab('ftp')" :ripple="false">
      </q-tab>
      <q-tab no-caps name="primordial" class="q-px-none q-py-md q-mr-md" :label="tc('原生API使用说明')"
             icon="las la-book-reader" @click="changeTab('primordial')" :ripple="false">
      </q-tab>
      <q-tab no-caps name="s3" class="q-px-none q-py-md q-mr-md" icon="las la-comment-dots" :label="tc('S3兼容API使用说明')"
             @click="changeTab('s3')" :ripple="false">
      </q-tab>
      <q-tab no-caps name="rclone" class="q-px-none q-py-md q-mr-md" icon="las la-copy" :label="tc('Rclone使用说明')"
             @click="changeTab('rclone')" :ripple="false">
      </q-tab>
    </q-tabs>
    <q-separator/>
    <q-tab-panels v-model="activeItem" animated>
      <q-tab-panel name="ftp" class="no-scroll">
        <div class="text-subtitle1 text-weight-bold">说明</div>
        <div class="q-mt-md">在iHarbor站点存储桶列表页面，可以开启存储桶的ftp访问功能，并设置读写/只读密码。</div>
        <div class="q-mt-md">
          <span>FTP服务地址：</span>
          <span class="text-weight-bold">obsftp.cstcloud.cn </span>
          <span>；用户名为</span>
          <span class="text-weight-bold">存储桶名称</span>
          <span>；使用</span>
          <span class="text-weight-bold">读写/只读密码</span>
          <span>登录后分别具有对应权限。</span>
        </div>
        <div class="q-mt-md">另：被动模式下返回字符使用utf8编码；主动模式为了兼容windows网络映射，返回字符使用gbk编码。</div>
        <div class="q-mt-xl text-weight-bold">一：通过FTP客户端（推荐普通用户使用该方式）：</div>
        <div class="q-mt-xl download cursor-pointer" @click="goPage('https://filezilla-project.org/download.php?type=client')">点击下载：FileZilla开源ftp客户端</div>
        <div class="q-mt-lg">FTP 服务器连接信息：</div>
        <div>
          <ul>
            <li>地址： obsftp.cstcloud.cn</li>
            <li>用户名：桶名称</li>
            <li>密码：页面自行设置查看</li>
          </ul>
        </div>
        <div class="q-mt-xl text-weight-bold">使用网络映射的方式挂载FTP（由于防火墙等限制，建议申请科技云windows主机进行挂载）</div>
        <div class="q-mt-xl text-weight-bold">其它过时的（由于开启ftps加密传输，不建议使用FlashFXP）：</div>
        <div class="q-mt-xl cursor-pointer download">点击下载: Windwos FTP客户端FlashFXP</div>
      </q-tab-panel>
      <q-tab-panel name="primordial" class="no-scroll">
        <div class="text-weight-bold">1.身份认证方式</div>
        <div class="q-mt-md">API访问需要身份认证，安全凭证是用于用户身份认证的凭证，iHarbor云对象存储服务支持多种安全认证方式，如BasicAuthentication身份认证,Session,Token,访问密钥。推荐使用访问密钥方式；</div>
        <div class="q-mt-md text-weight-bold">2.Auth Token认证</div>
        <div class="q-mt-md">Token密钥认证方式，使用简单，安全性相对较低，推荐内网使用，token的获取可以通过开放的API获取,或者去iHarbor站点通过浏览器端网页获取。 每个用户同一时刻只有一个有效的token，token永久有效，没有有效期，刷新创建新token，旧token会失效，如果token泄露，请及时创建新的token，以防数据泄露丢失。</div>
        <div class="q-mt-md">Token应包含在Authorization HTTP标头中，密钥应以字符串文字“Token”为前缀，空格分隔两个字符串。 例如：</div>
        <div class="text-weight-bold">Authorization: Token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b</div>
        <div class="q-mt-md text-weight-bold">3.JWT认证</div>
        <div class="q-mt-md">
        <ul>
          <li>
            <div>原生JWT认证</div>
            <div class="q-mt-md">
              <span>Json web token认证方式，使用简单，包括access jwt和refresh jwt，access jwt有效期为8h，旧的access jwt失效前可以通过对应API携带refresh jwt在有效时限（2天）内刷新获取新的access jwt。 jwt应包含在Authorization HTTP标头中，密钥应以字符串文字“</span>
              <span class="text-weight-bold">Bearer</span>
              <span>”为前缀，空格分隔两个字符串，例如：</span>
            </div>
            <div class="text-weight-bold">Authorization: Bearer eyJhbGciOiAiSFMyNTYiLCAidHlwIj</div>
          </li>
          <li class="q-mt-md">
            <div>科技云通行证JWT认证</div>
            <div class="q-mt-md">jwt应包含在Authorization HTTP标头中，密钥应以字符串文字“AAI-JWT”为前缀，空格分隔两个字符串，例如：</div>
            <div class="text-weight-bold">Authorization: AAI-JWT eyJhbGciOiAiSFMyNTYiLCAidHlwIj</div>
          </li>
        </ul>
        </div>
        <div class="q-mt-md text-weight-bold">4.访问密钥</div>
        <div class="q-mt-md">访问密钥是一个密钥对（AccessKey和SecretKey），AccessKey会在网络中传输，SecretKey不在网络上传输，需要用户妥善保管。 密钥对用于安全凭证的生成，通过一些签名算法，以SecretKey为加密参数，对一些适当的数据内容进行加密生成安全凭证。访问密钥认证方式安全性高，使用会复杂一些。</div>
        <div>若SecretKey意外泄露或被恶意第三方窃取，可能导致数据泄漏风险。若发生密钥泄露等安全问题，密钥拥有着应第一时间在EBHarbor平台 的安全凭证中更换密钥。</div>
        <div class="q-mt-md">
          <span>具体请参考访问</span>
          <span class="download cursor-pointer" @click="goPage('http://obs.cstcloud.cn/docs/#/security')">密钥使用方法。</span>
        </div>
        <div class="q-mt-md text-weight-bold">5.Bucket Token</div>
        <div class="q-mt-md">每个存储桶Bucket都可以创建2个存储桶自己的token（只有权限读写token对应的存储桶），token有2种访问权限，只读和可读可写；</div>
        <div class="q-mt-md">bucket token应包含在Authorization HTTP标头中，密钥应以字符串文字“BucketToken”为前缀，空格分隔两个字符串。 例如：</div>
        <div class="text-weight-bold">Authorization: BucketToken 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b</div>
        <div class="q-mt-md text-weight-bold">6.API研发文档与示例参考</div>
        <div class="q-mt-md">
          <span>API在线说明与测试文档：</span>
          <span class="download cursor-pointer" @click="goPage('http://obs.cstcloud.cn/apidocs/')">http://obs.cstcloud.cn/apidocs/</span>
        </div>
        <div class="q-mt-md">
          <span class="text-weight-bold">API调用参考示例（Python）：</span>
          <span class="download cursor-pointer" @click="goPage('https://github.com/i-harbor/test')">https://github.com/i-harbor/test</span>
          <span>；</span>
        </div>
        <div class="q-mt-md">
          <span>为便于API的调用，我们提供了一个简单的Python包</span>
          <span class="download cursor-pointer" @click="goPage('https://github.com/i-harbor/pyharbor')">pyharbor</span>
          <span>；</span>
        </div>
      </q-tab-panel>
      <q-tab-panel name="s3" class="no-scroll">
        <div>提供部分兼容AWS S3接口的api访问iHarbor服务。</div>
        <div class="q-mt-md text-weight-bold">一&nbsp;&nbsp;注意事项</div>
        <div class="q-mt-md">1.&nbsp;AWS S3兼容接口与iHarbor原生api、ftp、网页端暂不可混用。</div>
        <div class="q-mt-md">（a）AWS S3兼容接口创建的桶bucket（以下称S3桶），不可通过iHarbor原生api，FTP和网页端访问（删除、上传）对象， 否则多部分上传对象part元数据会产生脏数据，会影响S3接口的使用。</div>
        <div class="q-mt-md">（b）通过iHarbor原生api和网页端创建的桶bucket（以下称原生桶），没有S3对象part元数据信息和概念,无法使用兼容AWS S3接口访问（上传、下载、删除、HeadObject等）桶内的对象；如果现有原生桶希望转为S3桶（此操作暂不可逆，即S3桶暂不支持转原生桶），请联系技术人员或发邮件至 hai@cnic.cn。</div>
        <div class="q-mt-md">2. iHarbor服务有目录的概念，同一路径下不支持同名的对象和目录存在；不支持删除非空目录。</div>
        <div class="q-mt-md">3. 多部分上传CompleteMultipartUpload接口可能耗时较长，part越多，part大小越大，合并一个对象需要的时间越长; 如果已请求合并，在未响应之前（如请求超时）重试发起第二次请求，会得到一个CompleteMultipartAlreadyInProgress错误码。</div>
        <div class="q-mt-md">4. 目前不支持对象锁，同时上传同一个对象，可能产生脏数据。</div>
        <div class="q-mt-md text-weight-bold">二&nbsp;&nbsp;域名endpoint</div>
        <div class="q-mt-md q-ml-md">只支持virtual-hosted style URL访问bucket的方式，不支持path style URL访问bucket的方式，无region。endpoint格式：http://BUCKET.s3.obs.cstcloud.cn。</div>
        <div class="q-mt-md text-weight-bold">三&nbsp;&nbsp;存储类型</div>
        <div class="q-mt-md">对象存储iHarbor只支持标准（STANDARD）一种存储类型, 默认为STANDARD。</div>
        <div class="q-mt-md text-weight-bold">四&nbsp;&nbsp;签名认证</div>
        <div class="q-mt-md q-ml-md">兼容AWS Signature Version 4，支持请求头签名和参数签名方式。</div>
        <div class="q-mt-md q-ml-md">数据上传方式只支持单个块传输，不支持多块传输方式(Content-Encoding:aws-chunked)。</div>
        <div class="q-mt-md text-weight-bold">五&nbsp;&nbsp;公共标头</div>
        <div class="row q-mt-lg justify-center">
        <table border="1" style="border-collapse: collapse;" class="col-4 text-center">
          <tr class="text-weight-bold">
            <td>标头</td>
            <td>说明</td>
          </tr>
          <tr>
            <td>Authorization</td>
            <td>兼容</td>
          </tr>
          <tr>
            <td>Content-Length</td>
            <td>兼容</td>
          </tr>
          <tr>
            <td>Content-Type</td>
            <td>兼容</td>
          </tr>
          <tr>
            <td>Content-MD5</td>
            <td>兼容</td>
          </tr>
          <tr>
            <td>Date</td>
            <td>兼容</td>
          </tr>
          <tr>
            <td>Host</td>
            <td>兼容</td>
          </tr>
          <tr>
            <td>ETag</td>
            <td>兼容</td>
          </tr>
          <tr>
            <td>x-amz-request-id</td>
            <td>不支持</td>
          </tr>
          <tr>
            <td>x-amz-id-2</td>
            <td>不支持</td>
          </tr>
          <tr>
            <td>x-amz-version-id</td>
            <td>不支持</td>
          </tr>
        </table>
        </div>
        <div class="q-mt-md text-weight-bold">六&nbsp;&nbsp;兼容API</div>
        <div class="q-mt-md">1.&nbsp;Service API</div>
        <div class="row q-mt-lg justify-center">
          <table border="1" style="border-collapse: collapse;" class="col-4 text-center">
          <tr class="text-weight-bold">
            <td>API</td>
            <td>请求</td>
            <td>响应</td>
          </tr>
          <tr>
            <td>ListBuckets</td>
            <td>兼容</td>
            <td>兼容</td>
          </tr>
        </table>
        </div>
        <div class="q-mt-md">2.&nbsp;Bucket API</div>
        <div class="row q-mt-lg justify-center">
          <table border="1" style="border-collapse: collapse;" class="col-8 text-center">
            <tr class="text-weight-bold">
              <td>API</td>
              <td>请求</td>
              <td>响应</td>
            </tr>
            <tr>
              <td>CreateBucket</td>
              <td>
                <div>不支持区域指定，不需要请求体；</div>
                <div>参数x-amz-acl部分支持，有效值: private，public-read，public-read-write；</div>
                <div>其他参数不支持</div>
              </td>
              <td>兼容</td>
            </tr>
            <tr>
              <td>DeleteBucket</td>
              <td>兼容</td>
              <td>兼容</td>
            </tr>
            <tr>
              <td>HeadBucket</td>
              <td>兼容</td>
              <td>兼容</td>
            </tr>
          </table>
        </div>
        <div class="q-mt-md">3.&nbsp;Object API</div>
        <div class="row q-mt-lg justify-center">
          <table border="1" style="border-collapse: collapse;" class="col-8 text-center">
            <tr class="text-weight-bold">
              <td>API</td>
              <td>请求</td>
              <td>响应</td>
              <td>说明</td>
            </tr>
            <tr>
              <td>PutObject</td>
              <td>
                <div>支持请求头:</div>
                <div>x-amz-storage-class只能取值STANDARD，默认STANDARD；</div>
                <div>x-amz-acl部分支持，有效值: private，public-read，public-read-write；</div>
                <div>其他参数不支持；</div>
              </td>
              <td>仅兼容ETag</td>
              <td>只支持基础上传功能，目录创建</td>
            </tr>
            <tr>
              <td>DeleteObject</td>
              <td>VersionId参数不支持，标头x-amz-*不支持；</td>
              <td>标头x-amz-*不支持；</td>
              <td>只支持基础删除功能，删除对象或目录，此请求会直接物理永久删除对象</td>
            </tr>
            <tr>
              <td>ListObjectV2</td>
              <td>兼容</td>
              <td>兼容</td>
              <td>无</td>
            </tr>
            <tr>
              <td>GetObject</td>
              <td>
                <div>支持标头：Range, If-*；</div>
                <div>仅支持参数：partNumber，response-content-disposition，response-content-type，response-content-encoding， response-content-language；</div>
              </td>
              <td>兼容标头：Last-Modified, Content-Length, ETag, Content-Disposition, Content-Encoding，Content-Language，Content-Range，Content-Type；</td>
              <td>无</td>
            </tr>
            <tr>
              <td>HeadObject</td>
              <td>
                <div>支持标头：Range, If-*；</div>
                <div>支持参数：partNumber；</div>
              </td>
              <td>兼容标头：Last-Modified, Content-Length, ETag, Content-Range，Content-Type；</td>
              <td>无</td>
            </tr>
            <tr>
              <td>CreateMultipartUpload</td>
              <td>
                <div>标头x-amz-acl部分支持，有效值: private，public-read，public-read-write；</div>
                <div>标头x-amz-storage-class默认并只能为STANDARD, 其他参数不支持；</div>
              </td>
              <td>标头x-amz-*不兼容</td>
              <td>仅支持基础功能</td>
            </tr>
            <tr>
              <td>AbortMultipartUpload</td>
              <td>标头x-amz-request-payer不支持；</td>
              <td>标头x-amz-request-payer不支持；</td>
              <td>无</td>
            </tr>
            <tr>
              <td>CompleteMultipartUpload</td>
              <td>标头参数不支持；</td>
              <td>标头x-amz-*不兼容</td>
              <td>
                <div>仅支持基础功能；part越多，大小越大，合并一个对象需要的时间越长;</div>
                <div>如果已请求合并未响应之前，重试发起第二次请求，会得到一个CompleteMultipartAlreadyInProgress错误码；</div>
              </td>
            </tr>
            <tr>
              <td>UploadPart</td>
              <td>支持x-amz-content-sha256 数据校验; 标头x-amz-*不支持</td>
              <td>标头x-amz-*不支持</td>
              <td>仅支持基础上传功能</td>
            </tr>
            <tr>
              <td>ListMultipartUploads</td>
              <td>不支持参数delimiter</td>
              <td></td>
              <td></td>
            </tr>
          </table>
        </div>
      </q-tab-panel>
      <q-tab-panel name="rclone" class="no-scroll">
        <span>使用说明下载链接：</span>
        <span class="download cursor-pointer" @click="goPage('https://obs.cstcloud.cn/share/obs/rclone-doc/doc/iharbor%E5%AF%B9%E8%B1%A1%E5%AD%98%E5%82%A8rclone%E5%AE%A2%E6%88%B7%E7%AB%AF%E7%94%A8%E6%88%B7%E6%89%8B%E5%86%8Cv1.0.4.2.docx')">https://obs.cstcloud.cn/share/obs/rclone-doc/doc/iharbor%E5%AF%B9%E8%B1%A1%E5%AD%98%E5%82%A8rclone%E5%AE%A2%E6%88%B7%E7%AB%AF%E7%94%A8%E6%88%B7%E6%89%8B%E5%86%8Cv1.0.4.2.docx</span>
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>

<style lang="scss" scoped>
.Instructions {
  .download {
    color: $primary;
  }
}
</style>
