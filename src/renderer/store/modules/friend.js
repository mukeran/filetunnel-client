const state = {
  friendlist: [],
  friendRequests: []
}

const mutations = {
  updateFriendList (state, { friends }) {
    state.friendlist = friends
  },
  updateFriendRequests (state, { friendRequests }) {
    state.friendRequests = friendRequests
  }
}

const actions = {
  updateFriendList ({ commit }, { friends }) {
    commit('updateFriendList', { friends })
  },
  updateFriendRequests ({ commit }, { friendRequests }) {
    commit('updateFriendRequests', { friendRequests })
  }
}

export default {
  state,
  mutations,
  actions
}
