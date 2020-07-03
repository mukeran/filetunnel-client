<template>
  <el-container>
    <el-header class="header">
      <Menu @login-click="isLoginDialogVisible = true" @friend-changed="refreshFriendList"/>
    </el-header>
    <el-main id="main" class="main">
      <el-row>
        <el-col :span="18" :offset="3">
          <router-view ref="main"></router-view>
        </el-col>
      </el-row>
    </el-main>
    <el-dialog
      title="登录/注册"
      :visible.sync="isLoginDialogVisible"
    >
      <Auth :show-title="false" @logged-in="isLoginDialogVisible = false"/>
    </el-dialog>
  </el-container>
</template>

<script>
  import Menu from './Menu'
  import Auth from './Auth'
  import { ipcRenderer } from 'electron'
  import { mapState } from 'vuex'
  import status from '../../client/status'
  export default {
    name: 'Dashboard',
    components: { Menu, Auth },
    data () {
      return {
        isLoginDialogVisible: false
      }
    },
    mounted () {
      if (this.$route.name === 'Dashboard') {
        this.$router.push({ name: 'FriendList' })
      }
      if (this.connectionStatus === status.connection.DISCONNECTED) {
        ipcRenderer.send('connectServer')
      } else if (this.connectionStatus === status.connection.CONNECTED) {
        this.resumeSession()
      }
    },
    methods: {
      resumeSession () {
        if (this.sessionId !== null) {
          this.$message.info('正在尝试恢复会话...')
          ipcRenderer.once('sessionResumed', () => {
            this.$message.success('会话已恢复')
            this.refreshFriendList()
          })
          ipcRenderer.send('resumeSession')
        }
        ipcRenderer.send('registerAliveTimeout')
      },
      refreshFriendList () {
        if (this.$route.name === 'FriendList') {
          this.$refs.main.requestFriendList()
        }
      }
    },
    watch: {
      $route (to) {
        if (to.name === 'Dashboard') {
          this.$router.push({ name: 'FriendList' })
        }
      },
      connectionStatus (newStatus) {
        if (newStatus === status.connection.CONNECTED) {
          this.$message.success('服务器已连接')
          this.resumeSession()
        } else if (newStatus === status.connection.DISCONNECTED) {
          this.$message.error('服务器连接已断开')
        }
      }
    },
    computed: {
      ...mapState({
        connectionStatus: state => state.system.connectionStatus,
        enableP2PTransfer: state => state.system.enableP2PTransfer,
        sessionId: state => state.user.sessionId
      })
    }
  }
</script>

<style scoped>
  .header {
    position: relative;
    width: 100%;
    height: 60px;
  }
  .main {
    position: absolute;
    left: 0;
    right: 0;
    top: 61px;
    bottom: 0;
    overflow-y: scroll;
  }
</style>
