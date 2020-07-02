<template>
  <el-form
    :model="form"
    label-width="90px"
    size="medium"
    style="text-align: center"
  >
    <el-form-item label="旧密码">
      <el-input type="password" v-model="form.oldPassword"></el-input>
    </el-form-item>
    <el-form-item label="新密码">
      <el-input type="password" v-model="form.newPassword"></el-input>
    </el-form-item>
    <el-form-item label="重复新密码">
      <el-input type="password" v-model="form.repeatNewPassword"></el-input>
    </el-form-item>
    <el-button type="primary" @click="modifyPassword">修改密码</el-button>
  </el-form>
</template>

<script>
import { ipcRenderer } from 'electron'
import status from '../../../../client/status'
import { mapState } from 'vuex'
export default {
  name: 'ModifyPassword',
  data () {
    return {
      form: {
        oldPassword: '',
        newPassword: '',
        repeatNewPassword: ''
      }
    }
  },
  methods: {
    modifyPassword () {
      ipcRenderer.once('passwordChanged', (event, packet) => {
        if (packet.status === status.OK) {
          alert('Password changed')
          // 发出一个事件，更改密码界面不可见
          this.$emit('password-changed')
        } else {
          alert('Failed to change password')
        }
      })
      if (this.form.newPassword === this.form.repeatNewPassword) {
        console.log('sending packet')
        ipcRenderer.send('changePassword', {username: this._id, password: this.form.oldPassword, newPassword: this.form.newPassword})
        // console.log(this.username + '  9999   ' + this._id)
      } else {
        alert('两次密码不一致')
      }
    }
  },
  computed: {
    ...mapState({
      _id: state => state.user._id,
      username: state => state.user.username
    })
  }
}
</script>

<style scoped>

</style>
