<template>
  <div>
    <template v-if="transfers.length === 0">
      <Notice icon="el-icon-files" word="传输队列为空"/>
    </template>
    <template v-else>
      <el-button type="danger" size="small" @click="removeAll"><i class="el-icon-delete-solid"></i>删除所有传输（包括进行中的传输）</el-button>
      <template v-for="transfer in transfers">
        <Transfer :key="transfer._id" :transfer="transfer" class="transfer"/>
      </template>
    </template>
  </div>
</template>

<script>
  /**
   * Transfer list component
   */
  import Transfer from './Transfer'
  import Notice from './Notice'
  import { mapState } from 'vuex'
  export default {
    name: 'TransferList',
    components: { Transfer, Notice },
    mounted () {
      document.title = '传输队列 - FileTunnel'
    },
    methods: {
      removeAll () {
        this.$store.dispatch('removeAllTransfers')
      }
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
