const state = {
  list: []
}

const mutations = {
  updateFriendList (state, { friends }) {
    state.list = friends
  }
}

const actions = {
  updateFriendList ({ commit }, { friends }) {
    commit('updateFriendList', { friends })
  }
}

export default {
  state,
  mutations,
  actions
}
