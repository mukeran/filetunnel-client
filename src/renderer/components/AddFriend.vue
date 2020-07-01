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
    <el-button type="primary" @click="addFriend">添加好友</el-button>
  </el-form>
</template>

<script>
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
      }
    }
  }
</script>

<style scoped>

</style>
