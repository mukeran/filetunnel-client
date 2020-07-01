import status from '../../../client/status'

const state = {
  connectionStatus: status.connection.DISCONNECTED
}

const mutations = {
  updateConnectionStatus (state, { connectionStatus }) {
    state.connectionStatus = connectionStatus
  }
}

const actions = {
  updateConnectionStatus ({ commit }, { connectionStatus }) {
    commit('updateConnectionStatus', { connectionStatus })
  }
}

export default {
  state,
  mutations,
  actions
}
