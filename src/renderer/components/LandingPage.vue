<template>
  <div>
    {{ isConnecting }}
    {{ isConnected }}
  </div>
</template>

<script>
  import { mapState } from 'vuex'
  import { ipcRenderer } from 'electron'

  export default {
    name: 'LandingPage',
    mounted () {
      document.title = 'Welcome to FileTunnel'
      ipcRenderer.send('connectServer')
    },
    watch: {
      isConnected (to) {
        if (to) {
          ipcRenderer.send('login', {
            username: '123',
            password: '123'
          })
        }
      }
    },
    computed: {
      ...mapState({
        username: state => state.user.username,
        uid: state => state.user.uid,
        isConnecting: state => state.connection.isConnecting,
        isConnected: state => state.connection.isConnected
      })
    }
  }
</script>

<style>

</style>
