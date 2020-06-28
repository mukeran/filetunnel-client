<template>
  <div>
    <router-link :to="{ name: 'Login' }">login</router-link>
  </div>
</template>

<script>
  import Login from './Login'
  import { mapState } from 'vuex'
  export default {
    name: 'LandingPage',
    components: { Login },
    mounted () {
      document.title = 'Welcome to FileTunnel'
      this.$store.commit('updateUserInfo', { uid: 123, username: '123' })
    },
    methods: {
      t () {
        alert(this.text)
      }
    },
    data () {
      return {
        isLoggedIn: false,
        test: 1,
        text: ''
      }
    },
    computed: {
      ...mapState({
        username: state => state.user.username
      })
    }
  }
</script>

<style>

</style>
