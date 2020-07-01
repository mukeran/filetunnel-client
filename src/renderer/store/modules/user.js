const state = {
  _id: null,
  username: null,
  sessionId: null
}

const mutations = {
  updateUserInfo (state, { _id, username, sessionId }) {
    state._id = _id
    state.username = username
    state.sessionId = sessionId
  }
}

const actions = {
  updateUserInfo ({ commit }, { _id, username, sessionId }) {
    commit('updateUserInfo', { _id, username, sessionId })
  }
}

export default {
  state,
  mutations,
  actions
}
