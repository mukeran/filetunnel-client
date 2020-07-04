<template>
  <div>
    <div v-for="request in friendRequests" :key="request._id" class="request">
      <span :style="{ width }">{{ request.fromUsername }} 向你发送了好友请求</span>
      <div class="request-control">
        <el-button type="primary" size="mini" icon="el-icon-check" circle @click="answer('accept', request._id, request.fromUsername)"></el-button>
        <el-button type="danger" size="mini" icon="el-icon-close" circle @click="answer('deny', request._id)"></el-button>
      </div>
    </div>
  </div>
</template>

<script>
  import { mapState } from 'vuex'
import { ipcRenderer } from 'electron'
  import status from '../../client/status'
  export default {
    name: 'FriendRequestList',
    props: {
      width: {
        type: String,
        default: '100px'
      }
    },
    methods: {
      answer (operation, _id, username) {
        ipcRenderer.once('friendRequestAnswered', (event, packet) => {
          if (packet.status === status.OK) {
            this.$messageQueue.success(`你已经和 ${username} 成为好友`)
            this.$store.dispatch('removeFriendRequest', _id)
            this.$emit('friend-changed')
          } else {
            this.$messageQueue.error('回答好友请求失败')
          }
          this.$store.dispatch('removeFriendRequest', _id)
        })
        ipcRenderer.send('answerFriendRequest', { _id, operation })
      }
    },
    computed: {
      ...mapState({
        friendRequests: state => state.friend.friendRequests
      })
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
