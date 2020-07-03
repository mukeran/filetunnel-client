<template>
  <el-card shadow="hover" class="transfer" :body-style="{ height: '100px' }">
    <el-row style="height: 100%">
      <el-col :span="9" style="height: 100%">
        <div class="transfer-control">
          <div>
            <span style="font-size: 20px">{{ transfer.filename }}</span><br>
            <span style="font-size: 12px">{{ getReadableFileSizeString(transfer.size) }}</span>
            <el-tag size="mini" type="primary" v-if="transfer.status === status.transfer.REQUEST">
              <i class="el-icon-question"></i>请求
            </el-tag>
            <el-tag size="mini" type="warning" v-else-if="transfer.status === status.transfer.CONNECTING">
              <i class="el-icon-sort"></i>等待连接
            </el-tag>
            <el-tag size="mini" type="warning" v-else-if="transfer.status === status.transfer.PENDING">
              <i class="el-icon-sort"></i>等待对方接受
            </el-tag>
            <el-tag size="mini" type="warning" v-else-if="transfer.status === status.transfer.TRANSFERRING">
              <i class="el-icon-sort"></i>传输
            </el-tag>
            <el-tag size="mini" type="success" v-else-if="transfer.status === status.transfer.FINISHED">
              <i class="el-icon-check"></i>完成
            </el-tag>
            <el-tag size="mini" type="danger" v-else-if="transfer.status === status.transfer.CANCELLED">
              <i class="el-icon-circle-close"></i>取消
            </el-tag>
            <el-tag size="mini" type="danger" v-else-if="transfer.status === status.transfer.FAILED">
              <i class="el-icon-warning"></i>失败
            </el-tag>
            <el-tag size="mini" type="danger" v-else-if="transfer.status === status.transfer.REJECTED">
              <i class="el-icon-error"></i>拒绝
            </el-tag>
            <el-tag size="mini" type="success" v-if="transfer.mode === 0">在线P2P</el-tag>
            <el-tag size="mini" type="success" v-if="transfer.mode === 1">在线中转</el-tag>
            <el-tag size="mini" type="info" v-if="transfer.mode === 2">离线</el-tag>
            <br>
            <span style="font-size: 10px">{{ transfer.sha1 }}</span><br>
            <span style="font-size: 12px">
              <template v-if="transfer.status === status.transfer.REQUEST
               || transfer.status === status.transfer.CONNECTING
               || transfer.status === status.transfer.PENDING">
                请求时间：{{ new Date(transfer.requestTime).toLocaleString() }}<br>
                过期时间：{{ new Date(transfer.deadline).toLocaleString() }}
              </template>
              <template v-else-if="transfer.status === status.transfer.TRANSFERRING">
                开始时间：{{ new Date(transfer.startTime).toLocaleString() }}
              </template>
              <template v-else-if="transfer.status === status.transfer.FINISHED">
                开始时间：{{ new Date(transfer.startTime).toLocaleString() }}<br>
                完成时间：{{ new Date(transfer.finishTime).toLocaleString() }}
              </template>
              <template v-else-if="transfer.status === status.transfer.CANCELLED">
                取消时间：{{ new Date(transfer.cancelTime).toLocaleString() }}
              </template>
              <template v-else-if="transfer.status === status.transfer.FAILED">
                失败时间：{{ new Date(transfer.failedTime).toLocaleString() }}
              </template>
              <template v-else-if="transfer.status === status.transfer.REJECTED">
                请求时间：{{ new Date(transfer.requestTime).toLocaleString() }}
              </template>
            </span><br>
            <span style="font-size: 14px">来自：{{ transfer.from }}</span>
          </div>
        </div>
      </el-col>
      <el-col :span="10" style="height: 100%">
        <div style="line-height: 10px" class="transfer-progress">
          <template v-if="transfer.status === status.transfer.TRANSFERRING">
            <el-progress
              :percentage="transfer.progress"
              :text-inside="true"
              :stroke-width="25"
              style="width: 75%"
            ></el-progress>
            <span style="font-size: 13px">{{ getReadableFileSizeString(transfer.speed) }}/s</span>
          </template>
          <template v-else>&nbsp;</template>
        </div>
      </el-col>
      <el-col :span="5" style="height: 100%">
        <div v-if="transfer.status === status.transfer.REQUEST" class="transfer-control">
          <el-button type="primary" icon="el-icon-check" @click="() => { handleRequest({ accept: true }) }"
                     circle></el-button>
          <el-button type="danger" icon="el-icon-close" @click="() => { handleRequest({ accept: false }) }"
                     circle></el-button>
        </div>
        <div v-else-if="transfer.status === status.transfer.CONNECTING
    || transfer.status === status.transfer.PENDING
    || transfer.status === status.transfer.TRANSFERRING" class="transfer-control">
          <el-button type="danger" icon="el-icon-close" @click="cancelTransfer" circle></el-button>
        </div>
        <div v-else-if="transfer.status === status.transfer.FINISHED" class="transfer-control">
          <el-button type="primary" icon="el-icon-folder-opened" @click="openFolder" circle></el-button>
          <el-button type="danger" icon="el-icon-delete" @click="removeTransfer" circle></el-button>
        </div>
        <div v-else class="transfer-control">
          <el-button type="danger" icon="el-icon-delete" @click="removeTransfer" circle></el-button>
        </div>
      </el-col>
    </el-row>
  </el-card>
</template>

<script>
  import status from '../../client/status'
  import { ipcRenderer, shell, remote } from 'electron'
  import { dirname } from 'path'

  export default {
    name: 'Transfer',
    props: {
      transfer: Object
    },
    computed: {
      status: () => status,
      filename () {
      }
    },
    methods: {
      getReadableFileSizeString: function (fileSizeInBytes) {
        let i = -1
        const byteUnits = [' KB', ' MB', ' GB', ' TB', 'PB', 'EB', 'ZB', 'YB']
        do {
          fileSizeInBytes = fileSizeInBytes / 1024
          i++
        } while (fileSizeInBytes > 1024)

        return Math.max(fileSizeInBytes, 0.1).toFixed(1) + byteUnits[i]
      },
      handleRequest: function ({ accept }) {
        let _id = this.transfer._id
        if (!accept) {
          ipcRenderer.send('fileRequest' + _id, { accept })
          return
        }
        remote.dialog.showSaveDialog({
          title: '选择保存路径',
          defaultPath: this.transfer.filename
        }, result => {
          if (typeof result === 'undefined') {
            return
          }
          console.log(result)
          this.$store.dispatch('updatePath', { filePath: result, _id })
          ipcRenderer.send('fileRequest' + _id, { accept, filePath: result })
        })
      },
      removeTransfer: function () {
        this.$store.dispatch('removeTransfer', { _id: this.transfer._id })
      },
      cancelTransfer: function () {
        ipcRenderer.send('cancelTransfer' + this.transfer._id)
      },
      openFolder: function () {
        shell.openItem(dirname(this.transfer.filePath))
      }
    }
  }
</script>

<style scoped>
  .transfer .transfer-progress {
    height: 100%;
    display: flex;
    justify-content: space-around;
    align-items: center;
  }

  .transfer .transfer-control {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>
