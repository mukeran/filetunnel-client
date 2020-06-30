<template>
  <div>
  </div>
</template>

<script>
  import { ipcRenderer } from 'electron'
  import { mapState } from 'vuex'
  export default {
    name: 'LandingPage',
    mounted () {
      document.title = 'Welcome to FileTunnel'
      // this.$router.push({ name: 'FriendList' })
      ipcRenderer.send('connectServer')
    },
    watch: {
      isConnected (to) {
        if (to) {
          console.log('test')
          ipcRenderer.once('requestFriendList.done', () => {
            console.log('done')
          })
          ipcRenderer.send('requestFriendList')
        }
      }
    },
    computed: {
      ...mapState({
        isConnected: state => state.connection.isConnected
      })
    }
  }
</script>

<style>

</style>
