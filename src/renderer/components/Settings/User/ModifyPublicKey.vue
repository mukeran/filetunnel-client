<template>
  <div>
    <el-alert
      title="重新生成公私钥对后，以原公钥发送的离线文件将无法解密"
      type="warning"
      :closable="false"
      show-icon>
    </el-alert>
    <el-form
      :model="form"
      label-width="100px"
      size="medium"
      style="text-align: center; margin-top: 10px"
    >
      <el-form-item label="公钥">
        <el-input type="text" v-model="form.publicKey" disabled>
          <template slot="append">
            <el-button @click="generateKeyPair">生成</el-button>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item label="私钥保存路径">
        <el-input type="text" v-model="form.privateKeySavePath" disabled>
          <template slot="append">
            <el-button @click="selectPrivateKeySavePath">选择路径</el-button>
          </template>
        </el-input>
      </el-form-item>
      <el-button type="primary" @click="modifyPublicKey">修改公钥并保存私钥</el-button>
    </el-form>
  </div>
</template>

<script>
  import { ipcRenderer, remote } from 'electron'

  export default {
    name: 'ModifyPublicKey',
    data () {
      return {
        form: {
          publicKey: '',
          privateKey: '',
          privateKeySavePath: ''
        }
      }
    },
    mounted () {
      this.form.privateKeySavePath = remote.app.getPath('userData') + '/privateKey.pem'
    },
    methods: {
      generateKeyPair () {
        ipcRenderer.once('keyPairGenerated', (event, { publicKey, privateKey }) => {
          this.form.publicKey = publicKey
          this.form.privateKey = privateKey
        })
        this.form.publicKey = '正在生成...可能会卡顿'
        ipcRenderer.send('generateKeyPair')
      },
      selectPrivateKeySavePath () {
        remote.dialog.showSaveDialog({
          defaultPath: this.form.privateKeySavePath
        }, savePath => {
          if (typeof savePath !== 'undefined') {
            this.form.privateKeySavePath = savePath
          }
        })
      },
      modifyPublicKey () {
      }
    }
  }
</script>

<style scoped>

</style>
