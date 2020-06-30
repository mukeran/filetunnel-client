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
          ipcRenderer.on('register-done', (event, args) => {
            console.log(event)
            console.log(args)
          })
          ipcRenderer.send('register', {
            username: '12345',
            password: '123',
            email: 'test@test.com'
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
