<template>
  <div>
    <Entry type="button" button-type="primary" @click="isModifyPasswordDialogVisible = true">
      <template slot="description">修改密码</template>
      <template slot="button-text">修改</template>
    </Entry>
    <Entry type="button" button-type="primary" @click="isModifyPublicKeyDialogVisible = true">
      <template slot="description">修改公钥</template>
      <template slot="button-text">修改</template>
    </Entry>
    <el-dialog
      title="修改密码"
      :visible.sync="isModifyPasswordDialogVisible"
    >
     <ModifyPassword/>
    </el-dialog>
    <el-dialog
      title="修改公钥"
      :visible.sync="isModifyPublicKeyDialogVisible"
    >
      <ModifyPublicKey/>
    </el-dialog>
  </div>
</template>

<script>
  import Entry from '../Entry'
  import ModifyPassword from './ModifyPassword'
  import ModifyPublicKey from './ModifyPublicKey'
  export default {
    name: 'Security',
    components: { Entry, ModifyPassword, ModifyPublicKey },
    data () {
      return {
        isModifyPasswordDialogVisible: false,
        isModifyPublicKeyDialogVisible: false
      }
    }
  }
</script>

<style scoped>

</style>
