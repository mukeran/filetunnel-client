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
            this.$messageQueue.success('密码修改成功')
            this.$emit('password-modified')
          } else {
            this.$messageQueue.error('密码修改失败')
          }
        })
        if (this.form.newPassword === this.form.repeatNewPassword) {
          ipcRenderer.send('changePassword', {
            password: this.form.oldPassword,
            newPassword: this.form.newPassword
          })
        } else {
          this.$messageQueue.error('两次密码输入不一致')
        }
      }
    }
  }
</script>

<style scoped>

</style>
