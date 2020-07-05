<template>
  <div class="notice">
    <i :class="[icon, 'icon']"></i>
    <span class="word">{{ word }}</span>
  </div>
</template>

<script>
  /**
   * Large notice component (for empty and friendList and offlineTransferList logged out display)
   */
  export default {
    name: 'Notice',
    props: {
      icon: {
        type: String,
        required: true
      },
      word: String
    }
  }
</script>

<style scoped>
  .notice {
    text-align: center;
  }
  .notice>.icon {
    display: block;
    font-size: 100px;
    color: #909399;
  }
  .notice>.word {
    display: block;
    margin-top: 15px;
    font-size: 18px;
    color: #909399;
  }
</style>
