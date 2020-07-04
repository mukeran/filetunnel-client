<template>
  <div style="text-align: center">
    <i class="el-icon-loading"></i>正在对离线传输文件进行加密和压缩，已经处理 {{ processedLength }} 字节
  </div>
</template>

<script>
  import { mapState } from 'vuex'
  export default {
    name: 'OfflineTransferDataProgress',
    computed: {
      ...mapState({
        processedLength: state => state.offlineTransfer.processedLength
      })
    }
  }
</script>

<style scoped>

</style>
