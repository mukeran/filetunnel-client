<template>
  <div>
    <template v-for="transfer in transfers">
      <Transfer :key="transfer._id" :transfer="transfer" class="transfer"/>
    </template>
  </div>
</template>

<script>
  import Transfer from './Transfer'
import { mapState } from 'vuex'
  export default {
    name: 'TransferList',
    components: { Transfer },
    mounted () {
      document.title = '传输队列 - FileTunnel'
    },
    computed: {
      ...mapState({
        transfers: state => state.transfer.transfers
      })
    }
  }
</script>

<style scoped>
  .transfer:not(:first-child) {
    margin-top: 10px;
  }
</style>
