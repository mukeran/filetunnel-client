<template>
  <div>
    <template v-if="this.sessionId === null">
      <Notice icon="el-icon-info" word="登录后才可获取离线传输列表"/>
    </template>
    <template v-else>
      <div>
        <span style="font-size: 15px"><i class="el-icon-download"></i>接收的离线传输</span>
        <el-table
          :data="offlineTransfers"
          stripe
          empty-text="无接收的离线传输"
        >
          <el-table-column
            prop="filename"
            label="文件名"
          ></el-table-column>
          <el-table-column label="大小">
            <template slot-scope="scope">{{ getReadableFileSizeString(scope.row.size) }}</template>
          </el-table-column>
          <el-table-column
            prop="sha1"
            label="SHA1"
          ></el-table-column>
          <el-table-column
            prop="fromUsername"
            label="发送方"
          ></el-table-column>
          <el-table-column
            prop="time"
            label="发送时间"
          >
            <template slot-scope="scope">
              {{ new Date(scope.row.time).toLocaleString() }}
            </template>
          </el-table-column>
          <el-table-column
            prop="deadline"
            label="过期时间"
          >
            <template slot-scope="scope">
              {{ new Date(scope.row.deadline).toLocaleString() }}
            </template>
          </el-table-column>
          <el-table-column label="操作" fixed="right" width="90">
            <template slot-scope="scope">
              <el-button type="primary" size="mini" @click="download(scope.row)"><i class="el-icon-download"></i>下载</el-button><br>
              <el-button
                type="danger"
                size="mini"
                @click="reject(scope.row._id)"
                v-if="scope.row.status === status.offlineTransfer.PENDING"
                style="margin-top: 5px"
              >
                <i class="el-icon-close"></i>拒绝
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div style="margin-top: 20px">
        <span style="font-size: 15px"><i class="el-icon-upload2"></i>发起的离线传输</span>
        <el-button size="small" @click="queryOfflineTransfers" circle>
          <i class="el-icon-refresh"></i>
        </el-button>
        <el-table
          :data="launchedOfflineTransfers"
          stripe
          empty-text="无发起的离线传输"
          v-loading="isLoading"
        >
          <el-table-column
            prop="filename"
            label="文件名"
          ></el-table-column>
          <el-table-column
            prop="sha1"
            label="SHA1"
          ></el-table-column>
          <el-table-column
            prop="toUsername"
            label="接收方"
          ></el-table-column>
          <el-table-column
            label="状态"
          >
            <template slot-scope="scope">
              <template v-if="scope.row.status === status.offlineTransfer.UPLOADING">正在上传</template>
              <template v-else-if="scope.row.status === status.offlineTransfer.PENDING">等待接收</template>
              <template v-else-if="scope.row.status === status.offlineTransfer.ACCEPTED">已接收</template>
              <template v-else-if="scope.row.status === status.offlineTransfer.REJECTED">已拒绝</template>
              <template v-else-if="scope.row.status === status.offlineTransfer.INVALID_SIGN">对方回复签名错误</template>
            </template>
          </el-table-column>
          <el-table-column
            prop="time"
            label="发送时间"
          >
            <template slot-scope="scope">
              {{ new Date(scope.row.time).toLocaleString() }}
            </template>
          </el-table-column>
          <el-table-column
            prop="deadline"
            label="过期时间"
          >
            <template slot-scope="scope">
              {{ new Date(scope.row.deadline).toLocaleString() }}
            </template>
          </el-table-column>
        </el-table>
      </div>
    </template>
  </div>
</template>

<script>
  /**
   * Offline transfer list component
   */
  import { ipcRenderer, remote } from 'electron'
  import { mapState } from 'vuex'
  import status from '../../client/status'
  import Notice from './Notice'
  export default {
    name: 'OfflineTransferList',
    components: { Notice },
    mounted () {
      document.title = '离线传输列表 - FileTunnel'
      if (this.sessionId !== null && this.connectionStatus === status.connection.CONNECTED) {
        this.queryOfflineTransfers()
      }
    },
    data () {
      return {
        launchedOfflineTransfers: [],
        isLoading: true
      }
    },
    methods: {
      getReadableFileSizeString: function (fileSizeInBytes) {
        if (fileSizeInBytes === 0) return ''
        let i = -1
        const byteUnits = [' KB', ' MB', ' GB', ' TB', 'PB', 'EB', 'ZB', 'YB']
        do {
          fileSizeInBytes = fileSizeInBytes / 1024
          i++
        } while (fileSizeInBytes > 1024)
        return Math.max(fileSizeInBytes, 0.1).toFixed(1) + byteUnits[i]
      },
      queryOfflineTransfers () {
        this.isLoading = true
        ipcRenderer.once('offlineTransfersQueried', (event, packet) => {
          this.isLoading = false
          this.launchedOfflineTransfers = packet.data.offlineTransfers.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
        })
        ipcRenderer.send('queryOfflineTransfers')
      },
      download (offlineTransfer) {
        this.$messageQueue.info(`正在验证文件 ${offlineTransfer.filename} 的签名，请稍候...`)
        ipcRenderer.once('signatureValidated', result => {
          if (!result) {
            this.$messageQueue.error(`文件 ${offlineTransfer.filename} 签名验证失败`)
            ipcRenderer.send('answerOfflineTransfer', {
              _id: offlineTransfer._id,
              operation: 'invalid_sign'
            })
            this.$store.dispatch('removeOfflineTransfer', offlineTransfer._id)
            return
          }
          remote.dialog.showSaveDialog({
            title: '选择保存路径',
            defaultPath: offlineTransfer.filename
          }, filePath => {
            if (typeof filePath === 'undefined') return
            ipcRenderer.once('offlineTransferAnswered', (event, err) => {
              if (err) {
                if (typeof err.status !== 'undefined' && err.status === status.NOT_FOUND) {
                  this.$messageQueue.error('离线文件已过期或者不存在')
                  this.$store.dispatch('removeOfflineTransfer', offlineTransfer._id)
                } else {
                  this.$messageQueue.error('请求接收离线文件失败')
                }
              } else {
                this.$messageQueue.success('请求接收离线文件成功，请在队列中查看传输进度')
                this.$store.dispatch('setOfflineTransferAccepted', offlineTransfer._id)
              }
            })
            ipcRenderer.send('answerOfflineTransfer', {
              ...offlineTransfer,
              operation: 'accept',
              filePath,
              fromUsername: offlineTransfer.fromUsername
            })
          })
        })
        ipcRenderer.send('validateSignature', offlineTransfer)
      },
      reject (_id) {
        ipcRenderer.once('offlineTransferAnswered', (event, packet) => {
          if (packet.status === status.OK) {
            this.$messageQueue.success('拒绝离线文件成功')
            this.$store.dispatch('removeOfflineTransfer', _id)
          } else {
            this.$messageQueue.error('拒绝离线文件失败')
          }
        })
        ipcRenderer.send('answerOfflineTransfer', {
          _id,
          operation: 'deny'
        })
      }
    },
    computed: {
      status: () => status,
      offlineTransfers () {
        const offlineTransfer = this.$store.state.offlineTransfer.offlineTransfers.slice(0)
        return offlineTransfer.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      },
      ...mapState({
        sessionId: state => state.user.sessionId,
        connectionStatus: state => state.system.connectionStatus
      })
    }
  }
</script>

<style scoped>

</style>
