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
      }
    }
  }
</script>

<style scoped>

</style>
