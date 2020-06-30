<template>
  <div>
    <Entry type="switch" v-model="enableCompression">
      <template slot="description">是否启用压缩减少流量消耗</template>
    </Entry>
    <Entry type="switch" v-model="enableEncryption">
      <template slot="description">是否启用 AES 加密</template>
    </Entry>
    <Entry type="switch" v-model="acceptOfflineTransfer">
      <template slot="description">是否接受离线传输</template>
    </Entry>
    <Entry type="switch" v-model="enableP2PTransfer">
      <template slot="description">是否接受 P2P 传输</template>
    </Entry>
    <Entry type="number" v-model="transferPort" width="100px" :min="1" :max="65535">
      <template slot="description">传输端口<br>（1~65535，推荐使用高位端口）</template>
    </Entry>
  </div>
</template>

<script>
  import Entry from '../Entry'
  export default {
    name: 'Universal',
    components: { Entry },
    data () {
      return {
        enableCompression: true,
        enableEncryption: true,
        acceptOfflineTransfer: true,
        enableP2PTransfer: true,
        transferPort: 12345
      }
    }
  }
</script>

<style scoped>

</style>
