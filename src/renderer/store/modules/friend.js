const state = {
  friends: [],
  friendRequests: []
}

const mutations = {
  /**
   * Update friend list
   * @param {Object} state Data storage
   * @param {List} param1 Friend list
   */
  updateFriendList (state, { friends }) {
    state.friends = friends
  },
  /**
   * Update friend requests
   * @param {Object} state Data storage
   * @param {List} param1 Friend requests
   */
  updateFriendRequests (state, { friendRequests }) {
    state.friendRequests = friendRequests
  },
  /**
   * Remove friend request
   * @param {Object} state Data storage
   * @param {String} _id Request _id
   */
  removeFriendRequest (state, _id) {
    state.friendRequests = state.friendRequests.filter(friendRequest => friendRequest._id !== _id)
  }
}

const actions = {
  updateFriendList ({ commit }, { friends }) {
    commit('updateFriendList', { friends })
  },
  updateFriendRequests ({ commit }, { friendRequests }) {
    commit('updateFriendRequests', { friendRequests })
  },
  removeFriendRequest ({ commit }, _id) {
    commit('removeFriendRequest', _id)
  }
}

export default {
  state,
  mutations,
  actions
}
