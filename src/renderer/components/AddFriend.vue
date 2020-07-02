<template>
  <el-form
    :model="form"
    label-width="80px"
    size="medium"
    style="text-align: center"
  >
    <el-form-item label="用户名">
      <el-input type="text" v-model="form.username"></el-input>
    </el-form-item>
    <el-button type="primary" @click="addFriend(form.username)">添加好友</el-button>
  </el-form>
</template>

<script>
import { ipcRenderer } from 'electron'
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
    async addFriend (username) {
      ipcRenderer.once('requestSended', (event, packet) => {
        this.requestFriendList()
      })
      await console.log('add username: ' + username)
      ipcRenderer.send('sendFriendRequest', { username })
    }
  }
}
</script>

<style scoped>
</style>
