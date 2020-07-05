<template>
  <div>
    <Entry
      type="button"
      button-type="primary"
      @click="isModifyPasswordDialogVisible = true"
      @password-changed="isModifyPasswordDialogVisible = false"
      :disabled="sessionId === null || connectionStatus !== status.connection.CONNECTED"
    >
      <template slot="description">修改密码</template>
      <template slot="button-text">修改</template>
    </Entry>
    <Entry
      type="button"
      button-type="primary"
      @click="isModifyPublicKeyDialogVisible = true"
      @publicKey-modified="isModifyPublicKeyDialogVisible = false"
      :disabled="sessionId === null || connectionStatus !== status.connection.CONNECTED"
    >
      <template slot="description">生成新的公私钥对</template>
      <template slot="button-text">进入</template>
    </Entry>
    <el-dialog
      title="修改密码"
      :visible.sync="isModifyPasswordDialogVisible"
    >
     <ModifyPassword @password-modified="isModifyPasswordDialogVisible = false"/>
    </el-dialog>
    <el-dialog
      title="生成新的公私钥对"
      :visible.sync="isModifyPublicKeyDialogVisible"
    >
      <ModifyPublicKey @public-key-modified="isModifyPublicKeyDialogVisible = false"/>
    </el-dialog>
  </div>
</template>

<script>
  /**
   * Security settings component
   */
  import Entry from '../Entry'
  import ModifyPassword from './ModifyPassword'
  import ModifyPublicKey from './ModifyPublicKey'
  import { mapState } from 'vuex'
  import status from '../../../../client/status'
  export default {
    name: 'Security',
    components: { Entry, ModifyPassword, ModifyPublicKey },
    data () {
      return {
        isModifyPasswordDialogVisible: false,
        isModifyPublicKeyDialogVisible: false
      }
    },
    computed: {
      status: () => status,
      ...mapState({
        sessionId: state => state.user.sessionId,
        connectionStatus: state => state.system.connectionStatus
      })
    }
  }
</script>

<style scoped>

</style>
