<template>
  <div>
    <el-table
      :data="friends"
      stripe
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
          <el-dropdown>
            <el-button type="primary" size="mini">
              <i class="el-icon-s-promotion"></i>发送<i class="el-icon-arrow-down"></i>
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item>在线发送</el-dropdown-item>
              <el-dropdown-item>离线发送</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          <el-button type="danger" size="mini"><i class="el-icon-delete-solid"></i>删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
  import SendFile from './NewTransfer'
  export default {
    name: 'FriendList',
    components: {SendFile},
    mounted () {
      document.title = '好友列表 - FileTunnel'
    },
    data () {
      return {
        friends: [
          {
            _id: '123',
            username: 'mukeran',
            isNAT: false,
            isOnline: true,
            ip: '127.0.0.1',
            port: 12345,
            lastSeen: new Date().toISOString()
          },
          {
            _id: '122131312334',
            username: 'mukeran123123123123123',
            isNAT: false,
            isOnline: false,
            lastSeen: new Date().toISOString()
          },
          {
            _id: '123123123121345',
            username: 'mukeran123123123123123',
            isNAT: true,
            isOnline: true,
            lastSeen: new Date().toISOString()
          },
          {
            _id: '123123123121345',
            username: 'mukeran123123123123123',
            isNAT: true,
            isOnline: true,
            lastSeen: new Date().toISOString()
          },
          {
            _id: '123123123121345',
            username: 'mukeran123123123123123',
            isNAT: true,
            isOnline: true,
            lastSeen: new Date().toISOString()
          },
          {
            _id: '123123123121345',
            username: 'mukeran123123123123123',
            isNAT: true,
            isOnline: true,
            lastSeen: new Date().toISOString()
          },
          {
            _id: '123123123121345',
            username: 'mukeran123123123123123',
            isNAT: true,
            isOnline: true,
            lastSeen: new Date().toISOString()
          },
          {
            _id: '123123123121345',
            username: 'mukeran123123123123123',
            isNAT: true,
            isOnline: true,
            lastSeen: new Date().toISOString()
          },
          {
            _id: '123123123121345',
            username: 'mukeran123123123123123',
            isNAT: true,
            isOnline: true,
            lastSeen: new Date().toISOString()
          },
          {
            _id: '123123123121345',
            username: 'mukeran123123123123123',
            isNAT: true,
            isOnline: true,
            lastSeen: new Date().toISOString()
          }
        ]
      }
    }
  }
</script>

<style scoped>

</style>
