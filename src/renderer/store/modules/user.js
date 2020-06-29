const state = {
  uid: null,
  username: null
}

const mutations = {
  updateUserInfo (state, { uid, username }) {
    state.uid = uid
    state.username = username
  }
}

const actions = {
  updateUserInfo ({ commit }, { uid, username }) {
    commit('updateUserInfo', { uid, username })
  }
}

export default {
  state,
  mutations,
  actions
}
