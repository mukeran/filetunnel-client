<template>
  <div>
    <Entry type="button" button-type="primary">
      <template slot="description">修改密码</template>
      <template slot="button-text">修改</template>
    </Entry>
    <Entry type="button" button-type="primary">
      <template slot="description">修改公钥</template>
      <template slot="button-text">修改</template>
    </Entry>
  </div>
</template>

<script>
  import Entry from '../Entry'
  export default {
    name: 'Security',
    components: { Entry }
  }
</script>

<style scoped>

</style>
