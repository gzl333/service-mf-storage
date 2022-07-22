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
        <div class="text-h6">Linux操作系统下使用rclone客户端</div>
        <div class="text-subtitle1 text-weight-bold q-mt-lg">1.下载</div>
        <div class="q-mt-md">
          <span>rclone客户端下载：</span>
          <span  class="download cursor-pointer" @click="goPage('https://gitee.com/gosc-cnic/iHarborRclone/releases')">https://gitee.com/gosc-cnic/iHarborRclone/releases</span>
        </div>
        <div>安装包包含2个文件：rclone 执行文件和 rclone.1 用户手册</div>
        <div class="text-subtitle1 text-weight-bold q-mt-lg">2.安装</div>
        <div class="q-mt-md">Linux：登录用户不为root，则使用 sudo</div>
        <div>sudo cp rclone /usr/bin/</div>
        <div>sudo chown root:root /usr/bin/rclone</div>
        <div>sudo chmod 755 /usr/bin/rclone</div>
        <div>sudo mkdir -p /usr/local/share/man/man1</div>
        <div>sudo cp rclone.1 /usr/local/share/man/man1/</div>
        <div>sudo mandb</div>
        <div class="text-subtitle1 text-weight-bold q-mt-lg">3.rclone客户端配置</div>
        <div class="q-mt-md">以root用户为例</div>
        <div class="text-weight-bold q-mt-lg">3.1直接修改配置文件</div>
        <div class="q-mt-md">
          <span>创建配置文件，</span>
          <span class="text-weight-bold">/root/.config/rclone/rclone.conf</span>
          <span>，输入以下配置内容，可填写多个配置</span>
        </div>
        <div class="q-mt-md row">
        <div>
          <div>[test]</div>
          <div>type = Iharbor</div>
          <div>username = test@cnic.cn</div>
          <div>password = 20220202</div>
          <div>endpoint = http://obs.cstcloud.cn</div>
        </div>
        <div class="q-ml-xl">
          <div>#远程别名</div>
          <div>#iharbor类型对象存储</div>
          <div>#用户名</div>
          <div>#密码</div>
          <div>#对象存储endpoint</div>
        </div>
        </div>
        <div class="q-mt-md">[casearth]</div>
        <div>type = Iharbor</div>
        <div>username = xxx@cnic.cn</div>
        <div>password = xxxxxx</div>
        <div>endpoint = http://obs.casearth.cn</div>
        <div class="q-mt-md">用户也可通过此配置文件直接修改配置。</div>
        <div>
          <span class="text-weight-bold">注意：</span>
          <span>若在3.1.2中设置了配置文件保护密码，那么只能使用3.1所示命令行方式进行配置修改;&nbsp;&nbsp;因使用密码混淆，在设置好配置文件后需要对应修改密码加密操作。</span>
        </div>
        <div class="q-mt-sm">[root@centos9 ~]# rclone config</div>
        <div>e) Edit existing remote</div>
        <div class="q-mt-lg text-weight-bold">3.2命令行配置</div>
        <div class="q-mt-md text-weight-bold">注：标黑标记为用户需要的操作和提示内容</div>
        <div class="q-mt-md text-weight-bold">rclone config </div>
        <div class="q-mt-md text-weight-bold">初始运行显示：</div>
        <div>n) New remote</div>
        <div>s) Set configuration password</div>
        <div>q) Quit config</div>
        <div class="q-mt-md text-weight-bold">已配置过远程显示（可操作对远程的修改）：</div>
        <div class="q-mt-md">Current remotes:</div>
        <div class="row">
        <table border="1" style="border-collapse: collapse;" class="col-3 text-center q-mt-md">
          <tr class="text-weight-bold">
            <td>Name</td>
            <td>Type</td>
          </tr>
          <tr>
            <td>test</td>
            <td>Iharbor</td>
          </tr>
          <tr>
            <td>test2</td>
            <td>Iharbor</td>
          </tr>
          <tr>
            <td>test3</td>
            <td>Iharbor</td>
          </tr>
        </table>
        </div>
        <div class="q-mt-md">e) Edit existing remote</div>
        <div>n) New remote</div>
        <div>d) Delete remote</div>
        <div>r) Rename remote</div>
        <div>c) Copy remote</div>
        <div>s) Set configuration password</div>
        <div>q) Quit config</div>
        <div>e/n/d/r/c/s/q></div>
        <div class="q-mt-lg text-weight-bold">3.2.1新建远程</div>
        <div class="q-mt-md text-weight-bold">e/n/d/r/c/s/q> n</div>
        <div class="row">
          <div>
            <div class="text-weight-bold">>name> test</div>
            <div>Option Storage.</div>
          </div>
          <div class="q-ml-xl">
            <div class="text-weight-bold">①远程端的别名</div>
            <div>②存储类型选项</div>
          </div>
        </div>
        <div>Type of storage to configure.</div>
        <div>Choose a number from below, or type in your own value.</div>
        <div class="q-mt-md">20 / Hubic</div>
        <div>\ (hubic)</div>
        <div>21 / Iharbor Cloud Object Storage System (OSS) </div>
        <div> \ (Iharbor)</div>
        <div>22 / In memory object storage system.</div>
        <div>\ (memory)</div>
<div class="row q-mt-md">
        <div>
          <div class="text-weight-bold">Storage> 21</div>
          <div>Option username.</div>
        </div>
        <div class="q-ml-xl">
          <div class="text-weight-bold">选择iharbor对象存储，对应的编号是21</div>
          <div class="text-weight-bold">③Iharbor对象存储用户名选项 登录obs1.cstcloud.cn/front/自行注册</div>
        </div>
</div>
        <div class="q-mt-md">Ibarbor username.</div>
        <div>Enter a value. Press Enter to leave empty.</div>
        <div class="row">
          <div>
            <div>username> test@cnic.cn</div>
            <div>Option password.</div>
          </div>
          <div class="q-ml-xl">
            <div>以test@cnic.cn为例进行演示</div>
            <div class="text-weight-bold">④Iharbor对象存储用户密码选项</div>
          </div>
        </div>
        <div>Iharbor password</div>
        <div>Choose an alternative below.</div>
        <div>y) Yes, type in my own password</div>
        <div>g) Generate random password</div>
        <div class="text-weight-bold">y/g>y&nbsp;&nbsp;&nbsp;选择y输入obs1.cstcloud.cn/front/网站的密码；选择g生成随机密码，无法认证</div>
        <div class="q-mt-md">Enter the password:</div>
        <div class="text-weight-bold">
          <span>password: 202202</span>
          <span class="q-ml-xl">默认不显示后端混淆加密</span>
        </div>
        <div>Confirm the password:</div>
        <div>password: 202202</div>
        <div class="text-weight-bold">
          <span>Option endpoint.</span>
          <span class="q-ml-xl">⑤endpoint选项</span>
        </div>
        <div>Endpoint for the service.</div>
        <div>Enter a value. Press Enter to leave empty.</div>
        <div class="text-weight-bold">endpoint> http://obs1.cstcloud.cn   对象存储iharbor的endpoint</div>
        <div>
          <span>Option apiVersion.</span>
          <span class="q-ml-xl text-weight-bold">⑥API版本选项</span>
        </div>
        <div>api version number</div>
        <div>Enter a string value. Press Enter for the default (v1).</div>
        <div class="text-weight-bold">apiVersion> v1</div>
        <div>
          <span>Edit advanced config?</span>
          <span class="q-ml-xl text-weight-bold">⑦是否进行高级配置，若无特殊需求，一般无须配置</span>
        </div>
        <div>y) Yes</div>
        <div>n) No (default)</div>
        <div class="text-weight-bold">
          <span>y/n>y</span>
          <span class="q-ml-xl">输入y，可进行有关高级配置，也可一路enter；输入n，无须进行高级配置</span>
        </div>
        <div class="q-mt-md text-weight-bold">以下是高级配置的内容，若不配置，可忽略。</div>
        <div class="q-mt-md">
          <span>Option upload_cutoff.</span>
          <span class="q-ml-xl text-weight-bold">7-1分片上传时分片大小配置</span>
        </div>
        <div>Cutoff for switching to chunked upload.</div>
        <div>This value should be set no larger than 4.657 GiB (== 5 GB).</div>
        <div>Enter a size with suffix K,M,G,T. Press Enter for the default (200Mi).&nbsp;&nbsp;默认是200M</div>
        <div class="text-weight-bold q-mt-xs">upload_cutoff></div>
        <div>
          <span>Option chunk_size.</span>
          <span class="q-ml-xl text-weight-bold">7-2大文件上传时分片大小</span>
        </div>
        <div>Upload chunk size.</div>
        <div>When uploading large files, chunk the file into this size.</div>
        <div>Must fit in memory. These chunks are buffered in memory and there</div>
        <div>might a maximum of "--transfers" chunks in progress at once.</div>
        <div>5,000,000 Bytes is the minimum size.</div>
        <div>Enter a size with suffix K,M,G,T. Press Enter for the default (75Mi).&nbsp;&nbsp;默认是75M</div>
        <div class="text-weight-bold q-mt-xs">chunk_size></div>
        <div>
          <span>Option disable_checksum.</span>
          <span class="q-ml-xl text-weight-bold">7-4 Md5校验是否开启选项</span>
        </div>
        <div>Disable checksums for large (> upload cutoff) files.</div>
        <div>Normally rclone will calculate the SHA1 checksum of the input before</div>
        <div>uploading it so it can add it to metadata on the object. This is great</div>
        <div>for data integrity checking but can cause long delays for large files</div>
        <div>to start uploading.</div>
        <div>Enter a boolean value (true or false). Press Enter for the default (false).&nbsp;&nbsp;默认启用</div>
        <div class="text-weight-bold q-mt-xs">disable_checksum></div>
        <div>
          <span>Option encoding.</span>
          <span class="q-ml-xl text-weight-bold">7-7编码格式选项</span>
        </div>
        <div>The encoding for the backend.</div>
        <div>See the [encoding section in the overview](/overview/#encoding) for more info.</div>
        <div>Enter a encoder.MultiEncoder value. Press Enter for the default </div>
        <div>(Slash,BackSlash,Del,Ctl,InvalidUtf8,Dot).</div>
        <div class="text-weight-bold q-mt-xs">encoding> </div>
        <div>Edit advanced config?</div>
        <div>y) Yes</div>
        <div>n) No (default)</div>
        <div class="text-weight-bold">y/n>n</div>
        <div class="q-mt-md">[test]</div>
        <div>type = Iharbor</div>
        <div>username = wanghuang@cnic.cn</div>
        <div>password = *** ENCRYPTED ***</div>
        <div class="q-mt-md">y) Yes this is OK (default)</div>
        <div>e) Edit this remote</div>
        <div>d) Delete this remote</div>
        <div class="text-weight-bold">y/e/d>y</div>
        <div class="text-weight-bold q-mt-lg">3.2.2设置配置信息保护密码</div>
        <div class="text-weight-bold q-mt-md">e/n/d/r/c/s/q> s</div>
        <div>Your configuration is not encrypted.</div>
        <div>If you add a password, you will protect your login information to cloud services.</div>
        <div>a) Add Password</div>
        <div>q) Quit to main menu</div>
        <div class="text-weight-bold">a/q> a</div>
        <div>Enter NEW configuration password:</div>
        <div class="text-weight-bold">password:</div>
        <div>Confirm NEW configuration password:</div>
        <div class="text-weight-bold">password:</div>
        <div>Password set</div>
        <div>Your configuration is encrypted.</div>
        <div>c) Change Password</div>
        <div>u) Unencrypt configuration</div>
        <div>q) Quit to main menu</div>
        <div class="text-weight-bold">c/u/q>q</div>
        <div class="q-mt-lg">以上我们配置了一个密码保护配置文件信息，当我们再次使用rclone config命令查看远程配置信息时，需要输入以上密码，如下所示：</div>
        <div class="q-mt-md">[root@centos7 rclone]# rclone config</div>
        <div>Enter configuration password:</div>
        <div class="text-weight-bold">password:</div>
        <div>Current remotes:</div>
        <div class="row">
          <table border="1" style="border-collapse: collapse;" class="col-3 text-center q-mt-md">
            <tr class="text-weight-bold">
              <td>Name</td>
              <td>Type</td>
            </tr>
            <tr>
              <td>test</td>
              <td>Iharbor</td>
            </tr>
            <tr>
              <td>ceshi</td>
              <td>Iharbor</td>
            </tr>
          </table>
        </div>
        <div class="q-mt-md">如果取消密码的话，如下所示：</div>
        <div class="text-weight-bold">e/n/d/r/c/s/q> s</div>
        <div>Your configuration is encrypted.</div>
        <div>c) Change Password</div>
        <div>u) Unencrypt configuration</div>
        <div>q) Quit to main menu</div>
        <div class="text-weight-bold">c/u/q> u&nbsp;&nbsp;&nbsp;&nbsp;输入u，即可删掉保护密码</div>
        <div class="text-subtitle1 text-weight-bold q-mt-lg">3.3配置命令</div>
        <div class="text-weight-bold q-mt-md">3.3.1新建远程：</div>
        <div class="q-mt-md">rclone config create remote_name cloud_storage_type key=value</div>
        <div class="q-mt-xs">以键值对(key=value)的形式添加其他需要的参数。key包含3.1.1中新建远程时，基础配置和高级配置中出现的选项，均可进行配置和修改。</div>
        <div class="text-weight-bold q-mt-md">3.3.2更新远程配置：</div>
        <div class="q-mt-md">rclone config update remote_name key=value</div>
        <div class="q-mt-xs">key包含3.1.1中新建远程时，基础配置和高级配置中出现的选项，均可进行配置和修改。</div>
        <div class="text-weight-bold q-mt-md">3.3.3以json格式查看配置文件：</div>
        <div class="q-mt-md">rclone config dump</div>
        <div class="text-weight-bold q-mt-md">3.3.4查看rclone配置文件存储路径：</div>
        <div class="q-mt-md">rclone config file</div>
        <div class="text-weight-bold q-mt-md">3.3.5查看配置文件、缓存目录、临时目录的存储路径：</div>
        <div class="q-mt-md">rclone config paths</div>
        <div class="text-weight-bold q-mt-md">3.3.6查看远程配置：</div>
        <div class="q-mt-md">rclone config show</div>
        <div>rclone config show remote_name</div>
        <div class="text-weight-bold q-mt-md">3.3.7删除远程：</div>
        <div class="q-mt-md">rclone config delete remote_name</div>
        <div class="text-subtitle1 text-weight-bold q-mt-lg">4.常用命令</div>
        <div class="text-weight-bold q-mt-lg">4.1列出所有的remote</div>
        <div class="text-weight-bold q-mt-md">rclone listremotes</div>
        <div>test:</div>
        <div>ceshi:</div>
        <div>rclone listremotes --long</div>
        <div>test:&nbsp;&nbsp;Iharbor</div>
        <div>ceshi:&nbsp;&nbsp;Iharbor</div>
        <div class="text-weight-bold">注：（--long 参数可以显示remote对应的云存储类型）</div>
        <div class="text-weight-bold q-mt-lg">4.2创建存储桶</div>
        <div class="q-mt-md">rclone mkdir remote_name:bucket_name</div>
        <div class="q-mt-xs">remote_name: 在3.1.1中配置的别名，即name。以下命令中该字段均为此含义</div>
        <div class="text-weight-bold q-mt-lg">4.3查看存储桶列表</div>
        <div class="text-weight-bold q-mt-md">注：lsd 显示桶和目录操作，ls 显示文件操作</div>
        <div>rclone lsd remote_name:</div>
        <div class="text-weight-bold q-mt-lg">4.4查看存储桶下目录，不显示文件对象</div>
        <div class="q-mt-md">rclone lsd remote_name:bucket_name</div>
        <div class="text-weight-bold q-mt-lg">4.5查看存储桶内文件，不显示目录</div>
        <div class="q-mt-md">rclone ls remote_name:bucket_name/path</div>
        <div>path: 存储桶的目录</div>
        <div class="text-weight-bold q-mt-lg">4.6删除存储桶</div>
        <div class="q-mt-md">rclone rmdir remote_name:bucket_name</div>
        <div class="text-weight-bold q-mt-lg">4.7复制文件</div>
        <div class="q-mt-md">rclone copy local_path_file remote_name:bucket_name/path</div>
        <div>以上命令表示将本地文件复制到对象存储中</div>
        <div>rclone copy remote_name:bucket_name/path/filename  local_path </div>
        <div>以上命令表示将对象存储中的文件对象复制到本地</div>
        <div>rclone copyto local_path remote_name:bucket_name/path</div>
        <div>以上命令表示将本地目录复制到对象存储桶的某个目录下，且跳过相同的文件，只上传不同的文件</div>
        <div class="text-weight-bold q-mt-lg">4.8同步文件</div>
        <div class="q-mt-md">同步前，需在对象存储桶中提前创建path，否则会报目录不存在的错误。</div>
        <div>同步的目标是本地目录下的内容，不包括本地目录名，但是包含子目录名称。相同的目录同步，会保持远端和本地内容相同。</div>
        <div>rclone sync -i local_path remote_name:bucket_name/path</div>
        <div>（-i）参数显示以下选项：</div>
        <div class="row">
          <div>
            <div>y) Yes, this is OK (default)</div>
            <div>n) No, skip this</div>
            <div>s) Skip all copy operations with no more questions</div>
            <div>!) Do all copy operations with no more questions</div>
          </div>
          <div class="q-ml-xl">
            <div>默认一个文件一个文件地依次同步，速度较慢</div>
            <div>当前目录下的该文件（该文件不同步到对象存储中）</div>
            <div>跳过所有文件，即放弃同步该目录下所有文件</div>
            <div>将该目录下所有文件同步（跳过询问）</div>
          </div>
        </div>
        <div>q) Exit rclone now.</div>
        <div>rclone sync local_path remote_name:bucket_name/path </div>
        <div>以上命令不使用-i参数，默认并发同步本地目录下的文件</div>
        <div class="text-weight-bold q-mt-lg">4.9删除目录</div>
        <div class="q-mt-md text-weight-bold">注：删除目录时，需要确定该目录下的子文件都可以舍弃掉。</div>
        <div>rclone purge remote_name:bucket_name/path</div>
        <div class="text-weight-bold q-mt-lg">4.10删除文件对象</div>
        <div class="q-mt-md">rclone deletefile remote_name:bucket_name/path/filename</div>
        <div class="text-weight-bold q-mt-lg">4.11 查看文件md5</div>
        <div class="q-mt-md">rclone md5sum remote_name:bucket_name/path</div>
        <div class="text-weight-bold">注意：只显示当前目录下文件对象的md5值，不显示子目录下文件对象的md5值。分片上传的对象不计算md5值。</div>
        <div class="text-weight-bold q-mt-lg">4.12查看文件数量和大小</div>
        <div class="q-mt-md">rclone size remote_name:bucket_name/path/filename [--json](可选参数)</div>
        <div>以json格式查看：</div>
  <div class="text-weight-bold q-mt-lg">4.13查看目录下总文件数量和大小</div>
        <div class="q-mt-md">rclone size remote_name:bucket_name/path/ [--json](可选参数)</div>
        <div class="text-weight-bold">注意：不包含子目录下的文件。</div>
        <div class="text-weight-bold q-mt-lg">5.挂载</div>
        <div class="text-weight-bold q-mt-md">5.1 简单挂载</div>
        <div class="q-mt-md">rclone mount remote:path /localpath  --no-check-certificate --allow-other --allow-non-empty</div>
        <div>可以通过df 查看是否挂载成功</div>
        <div>解除挂载（在不使用时必须解除）</div>
        <div>fusermount -qzu /localpath </div>
        <div class="text-weight-bold q-mt-md">5.2 缓存挂载</div>
        <div class="q-mt-md">rclone mount remote:path /localpath   --cache-dir /work/vfsmout/ --vfs-cache-</div>
        <div>mode=writes --allow-non-empty --vfs-cache-max-size=50M --read-only</div>
        <div class="row q-mt-sm">
          <div>
            <span>参数：</span>
          </div>
          <div>
            <div>--allow-non-empty 允许挂载到非空目录（Windows 不支持）</div>
            <div>--allow-other 允许其他用户访问（Windows 不支持）</div>
            <div>--cache-dir 缓存目录</div>
            <div>--vfs-cache-max-size 缓存的最大值</div>
            <div>--read-only 只读访问</div>
          </div>
        </div>
        <div class="q-mt-sm">在/localpath目录中可以查看挂载内容的信息</div>
        <div class="text-weight-bold">注：不能将目录复制到挂载目录中。</div>
        <div class="text-h6 q-mt-lg">Windows操作系统下使用rclone客户端</div>
        <div class="text-subtitle1 text-weight-bold q-mt-lg">1.下载</div>
        <div class="q-mt-md">
          <span>rclone客户端下载：</span>
          <span  class="download cursor-pointer" @click="goPage('https://gitee.com/gosc-cnic/iHarborRclone/releases')">https://gitee.com/gosc-cnic/iHarborRclone/releases</span>
        </div>
        <div>安装包包含2个文件：rclone.exe 执行文件和 rclone.1用户手册</div>
        <div class="text-subtitle1 text-weight-bold q-mt-lg">2.安装</div>
        <div class="q-mt-md">将rclone.exe 和 rclone.1这两个文件复制到C:\Program Files\rclone目录下，您可自行设置rclone工具的安装位置。</div>
        <div>设置系统环境变量path，添加刚才设置的路径C:\Program Files\rclone，即可全局使用rclone工具。</div>
        <div>接着，打开cmd命令行工具。</div>
        <div>输入命令rclone version，显示如下所示rclone客户端版本信息则表示安装成功。</div>
        <div class="text-subtitle1 text-weight-bold q-mt-lg">3.rclone客户端配置</div>
        <div class="q-mt-md">
          <span>Windows操作系统下配置文件存放位置为：</span>
          <span class="text-weight-bold">C:\Users\xxxx\AppData\Roaming\rclone\rclone.conf</span>
        </div>
        <div>rclone配置方法参见linux操作系统下第3节rclone客户端配置。</div>
        <div>rclone常用命令参见linux操作系统下第4节常用命令。</div>
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
