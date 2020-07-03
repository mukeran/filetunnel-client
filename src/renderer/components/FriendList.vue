<template>
  <div>
    <el-button type="primary" size="small" @click="isAddFriendDialogVisible = true">
      <i class="el-icon-plus"></i>添加好友
    </el-button>
    <el-table
      :data="friends"
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
            <span v-if="scope.row.isNAT">NAT</span>
            <span v-else>{{ `${scope.row.ip}:${scope.row.port}` }}</span>
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
            @click="isNewTransferDialogVisible = true"
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
      <NewTransfer @transfer-sent="isNewTransferDialogVisible = false"/>
    </el-dialog>
  </div>
</template>

<script>
  import { mapState } from 'vuex'
  import { ipcRenderer } from 'electron'
  import status from '../../client/status'
  import AddFriend from './AddFriend'
  import NewTransfer from './NewTransfer'
  export default {
    name: 'FriendList',
    components: { AddFriend, NewTransfer },
    mounted () {
      document.title = '好友列表 - FileTunnel'
      if (this.sessionId !== null && this.connectionStatus === status.connection.CONNECTED) {
        this.requestFriendList()
      }
    },
    data () {
      return {
        isNewTransferDialogVisible: false,
        isAddFriendDialogVisible: false
      }
    },
    methods: {
      requestFriendList () {
        ipcRenderer.once('friendListRequested', (event, packet) => {
          this.$store.dispatch('updateFriendList', { friends: packet.data.friends })
        })
        ipcRenderer.send('requestFriendList')
      },
      deleteFriend (userId) {
        ipcRenderer.once('friendDeleted', (event, packet) => {
          if (packet.status !== status.OK) {
            this.$message.error(`删除好友 ${userId} 失败`)
          } else {
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
        friends: state => state.friend.friends
      })
    }
  }
</script>

<style scoped>
</style>
