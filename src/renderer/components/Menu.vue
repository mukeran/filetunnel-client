<template>
  <el-menu mode="horizontal" class="menu" :default-active="$route.path" router>
    <el-menu-item class="menu-logo">FileTunnel</el-menu-item>
    <el-menu-item index="/friend" class="menu-item"><i class="el-icon-user-solid"></i>好友</el-menu-item>
    <el-menu-item index="/message" class="menu-item"><i class="el-icon-s-order"></i>队列</el-menu-item>
    <el-menu-item index="/history" class="menu-item"><i class="el-icon-time"></i>历史</el-menu-item>
    <el-submenu class="menu-item menu-item-right" index="user">
      <template slot="title"><i class="el-icon-s-custom"></i>username</template>
      <el-menu-item index="settings"><i class="el-icon-setting"></i>设置</el-menu-item>
      <el-menu-item index="logout"><i class="el-icon-error"></i>登出</el-menu-item>
    </el-submenu>
  </el-menu>
</template>

<script>
  export default {
    name: 'Menu'
  }
</script>

<style scoped>
  .menu-logo {
    font-size: 18px;
  }
  .menu-item {
    font-size: 15px;
  }
  .menu-item.menu-item-right {
    float: right;
  }
</style>
