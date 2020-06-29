<template>
  <div>
    {{ username }}
    {{ uid }}
  </div>
</template>

<script>
  import { mapState } from 'vuex'
  export default {
    name: 'LandingPage',
    mounted () {
      document.title = 'Welcome to FileTunnel'
      this.$store.dispatch('updateUserInfo', { uid: 123, username: '123' })
    },
    computed: {
      ...mapState({
        username: state => state.user.username,
        uid: state => state.user.uid
      })
    }
  }
</script>

<style>

</style>
