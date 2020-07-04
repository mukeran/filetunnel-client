<template>
  <el-form
    :model="form"
    label-width="80px"
    size="medium"
    style="text-align: center"
  >
    <el-form-item label="用户名">
      <el-input type="text" v-model="form.username" @keyup.enter.native="addFriend"></el-input>
    </el-form-item>
    <el-button type="primary" @click="addFriend">添加好友</el-button>
  </el-form>
</template>

<script>
  import { ipcRenderer } from 'electron'
  import status from '../../client/status'
  export default {
    name: 'AddFriend',
    data () {
      return {
        form: {
          username: ''
        }
      }
    },
    methods: {
      addFriend () {
        if (this.form.username === '') {
          this.$messageQueue.error('请输入用户名')
          return
        }
        ipcRenderer.once('friendRequestSent', (event, packet) => {
          if (packet.status === status.OK) {
            this.$messageQueue.success('请求发送成功，请等待回应')
            this.$emit('request-sent')
          } else if (packet.status === status.user.NO_SUCH_USER) {
            this.$messageQueue.error('没有此用户')
          } else if (packet.status === status.user.ALREADY_FRIEND) {
            this.$messageQueue.error(`你和 ${this.form.username} 已经是朋友了`)
          } else if (packet.status === status.user.FRIEND_REQUEST_EXISTED) {
            this.$messageQueue.error('已经向目标发送过好友请求')
          } else if (packet.status === status.user.CANNOT_OPERATE_SELF) {
            this.$messageQueue.error('你不能添加自己为好友')
          } else {
            this.$messageQueue.error('请求发送失败')
          }
        })
        ipcRenderer.send('sendFriendRequest', { username: this.form.username })
      }
    }
  }
</script>

<style scoped>
</style>
