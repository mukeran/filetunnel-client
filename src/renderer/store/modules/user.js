/**
 * User about storage
 */

const state = {
  _id: null,
  username: null,
  sessionId: null,
  publicKey: null
}

const mutations = {
  updateUserInfo (state, { _id, username, sessionId, publicKey }) {
    state._id = _id
    state.username = username
    state.sessionId = sessionId
    state.publicKey = publicKey
  }
}

const actions = {
  updateUserInfo ({ commit }, { _id, username, sessionId, publicKey }) {
    commit('updateUserInfo', { _id, username, sessionId, publicKey })
  }
}

export default {
  state,
  mutations,
  actions
}
