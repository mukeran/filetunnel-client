<template>
  <div>
    <el-alert
      title="修改公钥后，以原公钥发送的离线文件将无法解密"
      type="warning"
      :closable="false"
      show-icon>
    </el-alert>
    <el-form
      label-width="90px"
      size="medium"
      style="text-align: center; margin-top: 10px"
    >
      <el-form-item label="你的旧公钥">
        <el-input type="textarea" v-model="publicKey" rows="4" disabled></el-input>
      </el-form-item>
      <el-form-item label="新公钥">
        <el-input type="textarea" v-model="newPublicKey" rows="4"></el-input>
      </el-form-item>
      <el-button type="primary" @click="modifyPublicKey">修改公钥</el-button>
    </el-form>
  </div>
</template>

<script>
  export default {
    name: 'ModifyPublicKey',
    data () {
      return {
        publicKey: '123123123213=',
        newPublicKey: '123123'
      }
    },
    methods: {
      modifyPublicKey () {
      }
    }
  }
</script>

<style scoped>

</style>
