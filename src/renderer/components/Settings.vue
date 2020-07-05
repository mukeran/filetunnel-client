<template>
  <div>
    <el-container>
      <el-aside width="200px">
        <el-menu
          :default-active="$route.path"
          router>
          <el-menu-item-group>
            <template slot="title">用户</template>
            <el-menu-item index="/settings/user/security">安全</el-menu-item>
            <el-menu-item index="/settings/user/privacy">隐私</el-menu-item>
          </el-menu-item-group>
          <el-menu-item-group>
            <template slot="title">传输</template>
            <el-menu-item index="/settings/transfer/universal">通用</el-menu-item>
          </el-menu-item-group>
        </el-menu>
      </el-aside>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </div>
</template>

<script>
  /**
   * Settings component
   */
  export default {
    name: 'Settings',
    mounted () {
      document.title = '设置 - FileTunnel'
      if (this.$route.name === 'Settings') {
        this.$router.push({ name: 'SettingsUserSecurity' })
      }
    },
    watch: {
      $route (to) {
        if (to.name === 'Settings') {
          this.$router.push({ name: 'SettingsUserSecurity' })
        }
      }
    }
  }
</script>

<style scoped>

</style>
