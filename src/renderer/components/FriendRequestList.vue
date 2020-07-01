<template>
  <div>
    <div v-for="request in friendRequests" :key="request._id" class="request">
      <span :style="{ width }">{{ request.fromUsername }} 向你发送了好友请求</span>
      <div class="request-control">
        <el-button type="primary" size="mini" icon="el-icon-check" circle @click="answer('accept', request._id)"></el-button>
        <el-button type="danger" size="mini" icon="el-icon-close" circle @click="answer('deny', request._id)"></el-button>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'FriendRequestList',
    props: {
      width: {
        type: String,
        default: '100px'
      }
    },
    data () {
      return {
        friendRequests: [
          {
            _id: '123',
            fromUserId: '123123',
            fromUsername: '123'
          },
          {
            _id: '124',
            fromUserId: '123123',
            fromUsername: '123'
          }
        ]
      }
    },
    methods: {
      answer (operation, _id) {
      }
    }
  }
</script>

<style scoped>
  .request {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }
  .request .request-control {
    display: flex;
    justify-content: space-around;
    align-items: center;
  }
</style>
