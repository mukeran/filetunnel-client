<template>
    <div class="login">
      <span v-if="showTitle" class="title">
        <template v-if="isLoginMode">登录</template>
        <template v-else>注册</template>
      </span>
      <el-form
        :model="form"
        label-width="100px"
        size="medium"
      >
        <el-form-item label="用户名">
          <el-input type="text" v-model="form.username" @keyup.enter.native="isLoginMode ? login() : register()"></el-input>
        </el-form-item>
        <el-form-item label="密码">
          <el-input type="password" v-model="form.password" @keyup.enter.native="isLoginMode ? login() : register()"></el-input>
        </el-form-item>
        <el-form-item v-if="isLoginMode" label="私钥路径">
          <el-input type="text" v-model="form.privateKeyPath" disabled>
            <template slot="append">
              <el-button @click="selectPrivateKeyPath">选择路径</el-button>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item v-if="!isLoginMode" label="重复密码">
          <el-input type="password" v-model="form.repeatPassword" @keyup.enter.native="register"></el-input>
        </el-form-item>
        <el-form-item v-if="!isLoginMode" label="公钥">
          <el-input type="text" v-model="form.publicKey" disabled>
            <template slot="append">
              <el-button @click="generateKeyPair">生成</el-button>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item v-if="!isLoginMode" label="私钥保存路径">
          <el-input type="text" v-model="form.privateKeySavePath" disabled>
            <template slot="append">
              <el-button @click="selectPrivateKeySavePath">选择路径</el-button>
            </template>
          </el-input>
        </el-form-item>
        <template v-if="isLoginMode">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button v-if="showRegister" @click="isLoginMode = !isLoginMode">没有帐号？点击前往注册</el-button>
        </template>
        <template v-else>
          <el-button type="primary" @click="register">注册</el-button>
          <el-button @click="isLoginMode = !isLoginMode">已经注册过帐号？点击前往登录</el-button>
        </template>
      </el-form>
    </div>
</template>

<script>
  import { ipcRenderer, remote } from 'electron'
  import status from '../../client/status'
  export default {
    name: 'Login',
    props: {
      showTitle: {
        type: Boolean,
        default: true
      },
      showRegister: {
        type: Boolean,
        default: true
      },
      validator: function (value) {
        return ['login', 'register'].indexOf(value) !== -1
      }
    },
    mounted () {
      this.form.privateKeyPath = this.form.privateKeySavePath = remote.app.getPath('userData') + '/privateKey.pem'
    },
    data () {
      return {
        isLoginMode: true,
        form: {
          username: '',
          password: '',
          repeatPassword: '',
          publicKey: '',
          privateKey: '',
          privateKeyPath: '',
          privateKeySavePath: ''
        }
      }
    },
    methods: {
      login () {
        ipcRenderer.once('loggedIn', (event, packet) => {
          if (packet.status === status.OK) {
            this.$store.dispatch('updateUserInfo', {
              _id: packet.data._id,
              username: packet.data.username,
              sessionId: packet.data.sessionId
            })
            this.$store.dispatch('updatePrivateKeyPath', {
              privateKeyPath: this.form.privateKeyPath
            })
            this.$emit('logged-in')
          } else if (packet.status === status.FAILED) {
            this.$message.error('登录失败')
          }
        })
        ipcRenderer.send('login', { username: this.form.username, password: this.form.password })
      },
      register () {
        ipcRenderer.once('registered', (event, packet) => {
          if (packet.status === status.OK) {
            alert('注册成功')
          } else {
            console.log(packet)
            alert('注册失败')
          }
        })
        if (this.form.publicKey === '') {
          this.$message.error('请先生成公私钥对')
          return
        }
        const fs = remote.require('fs')
        fs.writeFile(this.form.privateKeySavePath, this.form.privateKey, (err) => {
          if (err) {
            this.$message.error('私钥保存失败')
            return
          }
          this.$message.success(`私钥已经保存至 ${this.form.privateKeySavePath}`)
          // 执行 register 操作
          if (this.form.password === this.form.repeatPassword) {
            console.log('77777------------------sending datapacket------------------7777777777777777')
            ipcRenderer.send('register', {username: this.form.username, password: this.form.password, publicKey: this.form.publicKey})
            // console.log('444----------4444\n'+packet)
          } else {
            alert('两次密码不一致')
          }
        })
      },
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
      selectPrivateKeyPath () {
        remote.dialog.showOpenDialog({
          properties: ['openFile'],
          defaultPath: this.form.privateKeyPath
        }, path => {
          if (typeof path[0] !== 'undefined') {
            this.form.privateKeyPath = path[0]
          }
        })
      }
    }
  }
</script>

<style scoped>
  .login {
    text-align: center;
  }
  .login .title {
    font-size: 20px;
  }
</style>
