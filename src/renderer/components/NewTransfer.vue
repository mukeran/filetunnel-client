<template>
  <div style="text-align: center">
    <el-form
      :model="form"
      label-width="100px"
      size="medium"
    >
      <el-form-item label="发送对象">
        <el-select v-model="form.target" style="width: 100%">
          <el-option
            v-for="friend in friends"
            :key="friend._id"
            :label="friend.username"
            :value="friend._id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="模式">
        <el-select v-model="form.mode" style="width: 100%">
          <el-option label="在线-P2P" value="0"></el-option>
          <el-option label="在线-中转" value="1"></el-option>
          <el-option label="离线" value="2"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="接收截止时间">
        <el-date-picker
          v-model="form.deadline"
          type="datetime"
          placeholder="选择日期时间"
          style="width: 100%"
        >
        </el-date-picker>
      </el-form-item>
      <el-form-item label="文件路径">
        <el-input v-model="form.filePath" disabled>
          <template slot="append">
            <el-button @click="selectFile"><i class="el-icon-folder-opened"></i>选择文件</el-button>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item label="文件大小">
        <el-input v-model="form.size" disabled></el-input>
      </el-form-item>
      <el-form-item label="文件SHA1">
        <el-input v-model="form.sha1" disabled></el-input>
      </el-form-item>
      <el-button type="primary" @click="newTransfer">发送</el-button>
    </el-form>
  </div>
</template>

<script>
  import { remote, ipcRenderer } from 'electron'
  import { mapState } from 'vuex'
  export default {
    name: 'NewTransfer',
    data () {
      return {
        form: {
          target: '',
          mode: '0',
          deadline: '',
          filePath: '',
          size: '',
          sha1: ''
        }
      }
    },
    computed: {
      ...mapState({
        friends: state => state.friend.friends
      })
    },
    methods: {
      requestFriendList () {
        ipcRenderer.once('friendListRequested', (event, packet) => {
          this.$store.dispatch('updateFriendList', { friends: packet.data.friends })
        })
        ipcRenderer.send('requestFriendList')
      },
      selectFile () {
        this.requestFriendList()
        remote.dialog.showOpenDialog({
          properties: ['openFile']
        }, filePath => {
          if (typeof filePath === 'undefined') return
          this.form.filePath = filePath[0]
          const fs = remote.require('fs')
          fs.stat(filePath[0], (err, stats) => {
            if (err) {
              this.form.size = '文件信息读取失败'
              this.form.sha1 = '文件信息读取失败'
              return
            }
            this.form.size = stats.size
            this.form.sha1 = '正在计算SHA1'
            ipcRenderer.on('hashCalculated', (event, { filePath, sha1 }) => {
              if (this.form.filePath === filePath) {
                this.form.sha1 = sha1
              }
            })
            ipcRenderer.send('calculateHash', { filePath: filePath[0] })
          })
        })
      },
      newTransfer () {
        if (this.form.sha1 === '正在计算SHA1' || this.form.sha1 === '' || this.form.sha1 === '文件信息读取失败') {
          this.$message.error('SHA1计算中或者计算错误，请重新选择文件')
          return
        }
        let current
        let friends = this.friends
        for (let i = 0; i < friends.length; i++) {
          if (friends[i]._id === this.form.target) {
            current = friends[i]
            break
          }
        }
        console.log(current)
        // TODO my.isNAT
        if (current.isNAT && this.form.mode === '0') {
          this.$message.error('目标在NAT内, 不能P2P传输，请选择中转方式')
          return
        }
        // 中转方式 先请求Transmit 再调用P2P进行传输
        if (this.form.mode === '1') {
          ipcRenderer.send('requestTransmit', { targetUid: current._id,deadline: this.form.deadline, filePath: this.form.filePath, size: this.form.size, sha1: this.form.sha1 })
          this.this.$message.success('中转发送成功')
          this.$emit('transfer-sent')
        }
        if (this.form.mode === '0') {
          ipcRenderer.send('sendFile', { ip: current.ip, port: current.port, myUid: this.$store.state.user._id, targetUid: current._id, deadline: this.form.deadline, filePath: this.form.filePath, size: this.form.size, sha1: this.form.sha1 })
          this.$message.success('发送成功')
          this.$emit('transfer-sent')
        }
      }
    }
  }
</script>

<style scoped>

</style>
