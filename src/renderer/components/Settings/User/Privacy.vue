<template>
  <div>
    <Entry type="switch" v-model="acceptFriendRequest">
      <template slot="description">是否允许添加好友请求</template>
    </Entry>
    <Entry type="switch" v-model="showIPAddress">
      <template slot="description">是否显示 IP 地址<br>（关闭将会影响 P2P 传输）</template>
    </Entry>
  </div>
</template>

<script>
  import Entry from '../Entry'
  export default {
    name: 'Privacy',
    components: { Entry },
    data () {
      return {
        acceptFriendRequest: true,
        showIPAddress: true
      }
    }
  }
</script>

<style scoped>

</style>
