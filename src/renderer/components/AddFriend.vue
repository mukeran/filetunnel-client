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
        this.$message.error('请输入用户名')
        return
      }
      ipcRenderer.once('friendRequestSent', (event, packet) => {
        if (packet.status === status.OK) {
          this.$message.success('请求发送成功，请等待回应')
          this.$emit('request-sent')
        } else if (packet.status === status.user.NO_SUCH_USER) {
          this.$message.error('没有此用户')
        } else {
          this.$message.error('请求发送失败')
        }
      })
      ipcRenderer.send('sendFriendRequest', { username: this.form.username })
    }
  }
}
</script>

<style scoped>
</style>
