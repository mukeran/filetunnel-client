<template>
  <div style="text-align: center">
    <el-form
      :model="form"
      label-width="100px"
      size="medium"
    >
      <el-form-item label="发送对象">
        <el-select v-model="_target" style="width: 100%">
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
        <el-input :value="getReadableFileSizeString(form.size)" disabled></el-input>
      </el-form-item>
      <el-form-item label="文件SHA1">
        <el-input v-model="form.sha1" disabled></el-input>
      </el-form-item>
      <el-button type="primary" @click="newTransfer">发送</el-button>
    </el-form>
  </div>
</template>

<script>
  /**
   * New transfer component
   */
  import { remote, ipcRenderer } from 'electron'
  import { mapState } from 'vuex'
  export default {
    name: 'NewTransfer',
    props: {
      target: String
    },
    data () {
      return {
        form: {
          mode: '0',
          deadline: '',
          filePath: '',
          size: 0,
          sha1: ''
        }
      }
    },
    computed: {
      _target: {
        get () {
          return this.target
        },
        set (val) {
          this.$emit('update:target', val)
        }
      },
      ...mapState({
        friends: state => state.friend.friends
      })
    },
    methods: {
      /**
       * turn size in bytes into readable size
       */
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
          /** user canceled */
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
          this.$messageQueue.error('SHA1计算中或者计算错误，请重新选择文件')
          return
        }
        /** get selected friend */
        let current
        let friends = this.friends
        for (let i = 0; i < friends.length; i++) {
          if (friends[i]._id === this._target) {
            current = friends[i]
            break
          }
        }
        if (this.mode !== '2' && (current.port === '0' || current.port === 0)) {
          this.$messageQueue.error('对方没有启用P2P传输')
          return
        }
        if (current.isNAT && this.form.mode === '0') {
          this.$messageQueue.error('目标在NAT内, 不能P2P传输，请选择中转方式')
          return
        }
        switch (this.form.mode) {
          case '0': // P2P mode
            console.log('P2P request')
            ipcRenderer.send('sendFile', { ip: current.ip, port: current.port, myUid: this.$store.state.user._id, targetUid: current._id, deadline: this.form.deadline, filePath: this.form.filePath, size: this.form.size, sha1: this.form.sha1 })
            this.$messageQueue.success('发送成功')
            this.$emit('transfer-sent')
            break
          case '1': // Online tunnel transmit mode
            ipcRenderer.send('requestTransmit', { targetUid: current._id, deadline: this.form.deadline, filePath: this.form.filePath, size: this.form.size, sha1: this.form.sha1 })
            this.$messageQueue.success('中转请求已发送')
            this.$emit('transfer-sent')
            break
          case '2': // Offline transfer mode
            ipcRenderer.once('offlineTransferRequested', (event, { _id }) => {
              this.$messageQueue.info('离线传输请求已完成，请等待文件处理完成')
              this.$emit('transfer-sent')
            })
            ipcRenderer.send('requestOfflineTransfer', {
              userId: this._target,
              path: this.form.filePath,
              size: this.form.size,
              sha1: this.form.sha1,
              deadline: this.form.deadline,
              toUsername: current.username
            })
        }
      }
    }
  }
</script>

<style scoped>

</style>
