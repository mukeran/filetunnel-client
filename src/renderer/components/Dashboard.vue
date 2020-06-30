<template>
  <el-container>
    <el-header class="header">
      <Menu/>
    </el-header>
    <el-main id="main" class="main">
      <el-row>
        <el-col :span="18" :offset="3">
          <router-view></router-view>
        </el-col>
      </el-row>
    </el-main>
  </el-container>
</template>

<script>
  import Menu from './Menu'
  export default {
    name: 'Dashboard',
    components: { Menu }
  }
</script>

<style scoped>
  .header {
    position: relative;
    width: 100%;
    height: 60px;
  }
  .main {
    position: absolute;
    left: 0;
    right: 0;
    top: 61px;
    bottom: 0;
    overflow-y: scroll;
  }
</style>
