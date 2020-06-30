<template>
  <div>
    <template v-for="transfer in transfers">
      <Transfer :key="transfer._id" :transfer="transfer" class="transfer"/>
    </template>
  </div>
</template>

<script>
  import Transfer from './Transfer'
  import status from '../../client/status'
  export default {
    name: 'TransferList',
    components: { Transfer },
    mounted () {
      document.title = '传输列表 - FileTunnel'
    },
    data () {
      return {
        transfers: [
          {
            _id: '123',
            filename: 'test.zip',
            size: '100MiB',
            from: '127.0.0.1:12345',
            sha1: '96176af89c2366f94e28f96215173ade21ad6d7c',
            requestTime: new Date().toISOString(),
            deadline: new Date().toISOString(),
            mode: 0,
            status: status.transfer.REQUEST
          },
          {
            _id: '124',
            filename: 'test2.zip',
            size: '98MiB',
            from: '127.0.0.1:12445',
            sha1: '96176af89c2366f94e28f96215173ade21ad6d7c',
            mode: 2,
            startTime: new Date().toISOString(),
            status: status.transfer.TRANSFERRING,
            progress: 30,
            speed: '500 KiB/s'
          },
          {
            _id: '125',
            filename: 'test3.zip',
            size: '2MiB',
            from: '127.0.0.1:13415',
            sha1: '96176af89c2366f94e28f96215173ade21ad6d7c',
            mode: 1,
            startTime: new Date().toISOString(),
            finishTime: new Date().toISOString(),
            status: status.transfer.FINISHED
          },
          {
            _id: '126',
            filename: 'test4.zip',
            size: '64MiB',
            from: '127.0.0.1:3123',
            sha1: '96176af89c2366f94e28f96215173ade21ad6d7c',
            mode: 1,
            cancelTime: new Date().toISOString(),
            status: status.transfer.CANCELLED
          },
          {
            _id: '127',
            filename: 'test5.zip',
            size: '122MiB',
            from: '127.0.0.1:5412',
            sha1: '96176af89c2366f94e28f96215173ade21ad6d7c',
            mode: 0,
            failedTime: new Date().toISOString(),
            status: status.transfer.FAILED
          },
          {
            _id: '128',
            filename: 'test6.zip',
            size: '167MiB',
            from: '127.0.0.1:5212',
            sha1: '96176af89c2366f94e28f96215173ade21ad6d7c',
            mode: 2,
            requestTime: new Date().toISOString(),
            status: status.transfer.DENIED
          }
        ]
      }
    }
  }
</script>

<style scoped>
  .transfer:not(:first-child) {
    margin-top: 10px;
  }
</style>
