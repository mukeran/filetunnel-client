<template>
  <div>
    <template v-if="this.sessionId === null">
      <Notice icon="el-icon-info" word="登录后才可获取好友列表"/>
    </template>
    <template v-else>
      <el-button type="primary" size="small" @click="isAddFriendDialogVisible = true">
        <i class="el-icon-plus"></i>添加好友
      </el-button>
      <el-button size="small" @click="requestFriendList">
        <i class="el-icon-refresh">刷新好友列表</i>
      </el-button>
      <el-table
        :data="friends"
        v-loading="isLoading"
        stripe
        empty-text="你还没有好友哦，赶快去添加吧！"
        style="width: 100%">
        <el-table-column
          prop="_id"
          label="ID">
        </el-table-column>
        <el-table-column
          prop="username"
          label="用户名">
        </el-table-column>
        <el-table-column
          label="状态"
          width="160">
          <template slot-scope="scope">
            <template v-if="scope.row.isOnline">
              <span>在线</span>&nbsp;
              <el-tooltip effect="dark" content="对方为 NAT 状态时，无法进行 P2P 传输" placement="top" v-if="scope.row.isNAT">
                <el-tag type="danger" v-if="scope.row.isNAT">NAT</el-tag>
              </el-tooltip>
              <span>{{ `${scope.row.ip}:${scope.row.port}` }}</span>
            </template>
            <template v-else>
              <span>离线</span>
            </template>
          </template>
        </el-table-column>
        <el-table-column
          label="上一次活跃时间"
          width="200">
          <template slot-scope="scope">
            <i class="el-icon-time"></i>
            <span style="margin-left: 2px">{{ new Date(scope.row.lastSeen).toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          fixed="right"
          width="180">
          <template slot-scope="scope">
            <el-button
              type="primary"
              size="mini"
              @click="transferTo = scope.row._id; isNewTransferDialogVisible = true"
            ><i class="el-icon-s-promotion"></i>发送</el-button>
            <el-button type="danger" size="mini" @click="deleteFriend(scope.row._id)"><i class="el-icon-delete-solid"></i>删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-dialog
        title="添加好友"
        :visible.sync="isAddFriendDialogVisible"
      >
        <AddFriend @request-sent="isAddFriendDialogVisible = false"/>
      </el-dialog>
      <el-dialog
        title="发送文件"
        :visible.sync="isNewTransferDialogVisible"
      >
        <NewTransfer :target.sync="transferTo" @transfer-sent="isNewTransferDialogVisible = false"/>
      </el-dialog>
      <el-dialog
        title="正在处理离线传输文件"
        :visible="isOfflineTransferDataProgressVisible"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        :show-close="false"
      >
        <OfflineTransferDataProgress/>
      </el-dialog>
    </template>
  </div>
</template>

<script>
  import { mapState } from 'vuex'
  import { ipcRenderer } from 'electron'
  import status from '../../client/status'
  import AddFriend from './AddFriend'
  import NewTransfer from './NewTransfer'
  import OfflineTransferDataProgress from './OfflineTransferDataProgress'
  import Notice from './Notice'
  export default {
    name: 'FriendList',
    components: { AddFriend, NewTransfer, OfflineTransferDataProgress, Notice },
    mounted () {
      document.title = '好友列表 - FileTunnel'
      if (this.sessionId !== null && this.connectionStatus === status.connection.CONNECTED) {
        this.requestFriendList()
      } else if (this.sessionId === null) {
        this.$store.dispatch('updateFriendList', { friends: [] })
      }
    },
    data () {
      return {
        isNewTransferDialogVisible: false,
        isAddFriendDialogVisible: false,
        isLoading: true,
        transferTo: ''
      }
    },
    methods: {
      requestFriendList () {
        this.isLoading = true
        ipcRenderer.once('friendListRequested', (event, packet) => {
          this.isLoading = false
          if (packet.status === status.OK) {
            this.$store.dispatch('updateFriendList', { friends: packet.data.friends })
          } else {
            this.$store.dispatch('updateFriendList', { friends: [] })
          }
        })
        ipcRenderer.send('requestFriendList')
      },
      deleteFriend (userId) {
        ipcRenderer.once('friendDeleted', (event, packet) => {
          if (packet.status !== status.OK) {
            this.$messageQueue.error(`删除好友 ${userId} 失败`)
          } else {
            this.$messageQueue.success(`已删除好友 ${userId}`)
            this.requestFriendList()
          }
        })
        ipcRenderer.send('deleteFriend', { userId })
      }
    },
    watch: {
      sessionId (to) {
        if (to !== null && this.connectionStatus === status.connection.CONNECTED) {
          this.requestFriendList()
        }
      }
    },
    computed: {
      ...mapState({
        sessionId: state => state.user.sessionId,
        connectionStatus: state => state.system.connectionStatus,
        friends: state => state.friend.friends,
        isOfflineTransferDataProgressVisible: state => state.offlineTransfer.isOfflineTransferDataProgressVisible
      })
    }
  }
</script>

<style scoped>

</style>
