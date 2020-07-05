<template>
  <div>
    <Entry type="switch" v-model="enableCompression" disabled>
      <template slot="description">是否启用压缩减少流量消耗</template>
    </Entry>
    <Entry type="switch" v-model="enableEncryption" disabled>
      <template slot="description">是否启用 AES 加密</template>
    </Entry>
    <Entry type="switch" v-model="acceptOfflineTransfer" disabled>
      <template slot="description">是否接受离线传输</template>
    </Entry>
    <Entry type="switch" v-model="enableP2PTransfer">
      <template slot="description">是否接受 P2P 传输</template>
    </Entry>
    <Entry type="number" v-model="transferPort" width="100px" :min="0" :max="65535" disabled>
      <template slot="description">传输端口<br>（1~65535，推荐使用高位端口）</template>
    </Entry>
  </div>
</template>

<script>
  /**
   * Universal transfer settings component
   */
  import Entry from '../Entry'
  import { ipcRenderer } from 'electron'
  export default {
    name: 'Universal',
    components: { Entry },
    computed: {
      enableCompression: {
        get () { return this.$store.state.system.enableCompression },
        set (val) { this.$store.dispatch('updateEnableCompression', { enableCompression: val }) }
      },
      enableEncryption: {
        get () { return this.$store.state.system.enableEncryption },
        set (val) { this.$store.dispatch('updateEnableEncryption', { enableEncryption: val }) }
      },
      acceptOfflineTransfer: {
        get () { return this.$store.state.system.acceptOfflineTransfer },
        set (val) { this.$store.dispatch('updateAcceptOfflineTransfer', { acceptOfflineTransfer: val }) }
      },
      enableP2PTransfer: {
        get () { return this.$store.state.system.enableP2PTransfer },
        set (val) {
          // this.$store.dispatch('updateEnableP2PTransfer', { enableP2PTransfer: val })
          if (val) {
            ipcRenderer.send('startTransferServer')
          } else {
            ipcRenderer.send('stopTransferServer')
          }
        }
      },
      transferPort: {
        get () { return this.$store.state.system.transferPort },
        set () {}
      }
    }
  }
</script>

<style scoped>

</style>
