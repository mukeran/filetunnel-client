<template>
  <div>
  </div>
</template>

<script>
  import { mapState } from 'vuex'
  export default {
    name: 'LandingPage',
    mounted () {
      document.title = 'Welcome to FileTunnel'
      this.$router.push({ name: 'FriendList' })
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
