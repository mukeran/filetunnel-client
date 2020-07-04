<template>
  <div>
    <div>
      <span style="font-size: 15px"><i class="el-icon-download"></i>接收的离线传输</span>
      <el-table
        :data="offlineTransfers"
        stripe
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
        <el-table-column label="操作" fixed="right" width="180">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" @click="download(scope.row)"><i class="el-icon-download"></i>下载</el-button>
            <el-button type="danger" size="mini" @click="reject(scope.row._id)" v-if="scope.row.status === 1"><i class="el-icon-close"></i>拒绝</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div style="margin-top: 20px">
      <span style="font-size: 15px"><i class="el-icon-upload2"></i>发起的离线传输</span>
      <el-table
        :data="launchedOfflineTransfers"
        stripe
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
          prop="status"
          label="状态"
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
      </el-table>
    </div>
  </div>
</template>

<script>
  import { ipcRenderer, remote } from 'electron'
  import { mapState } from 'vuex'
  import status from '../../client/status'
  export default {
    name: 'OfflineTransferList',
    mounted () {
      document.title = '离线传输列表 - FileTunnel'
      if (this.sessionId !== null && this.connectionStatus === status.connection.CONNECTED) {
        this.queryOfflineTransfers()
      }
    },
    data () {
      return {
        launchedOfflineTransfers: []
      }
    },
    methods: {
      queryOfflineTransfers () {
        ipcRenderer.once('offlineTransfersQueried', (event, packet) => {
          console.log(packet)
          this.launchedOfflineTransfers = packet.data.offlineTransfers
        })
        ipcRenderer.send('queryOfflineTransfers')
      },
      download (offlineTransfer) {
        remote.dialog.showSaveDialog({
          title: '选择保存路径',
          defaultPath: offlineTransfer.filename
        }, filePath => {
          if (typeof filePath === 'undefined') return
          ipcRenderer.once('offlineTransferAnswered', (event, err) => {
            if (err) {
              this.$message.error('请求接收离线文件失败')
            } else {
              this.$message.success('请求接收离线文件成功，请在队列中查看传输进度')
            }
          })
          ipcRenderer.send('answerOfflineTransfer', {
            ...offlineTransfer,
            operation: 'accept',
            filePath
          })
        })
      },
      reject (_id) {
        ipcRenderer.once('offlineTransferAnswered', (event, packet) => {
          if (packet.status === status.OK) {
            this.$message.success('拒绝离线文件成功')
          } else {
            this.$message.error('拒绝离线文件失败')
          }
        })
        ipcRenderer.send('answerOfflineTransfer', {
          _id,
          operation: 'deny'
        })
      }
    },
    computed: {
      ...mapState({
        sessionId: state => state.user.sessionId,
        connectionStatus: state => state.system.connectionStatus,
        offlineTransfers: state => state.offlineTransfer.offlineTransfers
      })
    }
  }
</script>

<style scoped>
</style>
