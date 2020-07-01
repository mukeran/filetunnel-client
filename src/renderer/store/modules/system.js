import status from '../../../client/status'

const state = {
  connectionStatus: status.connection.DISCONNECTED,
  transferPort: 12345,
  privateKeyPath: ''
}

const mutations = {
  updateConnectionStatus (state, { connectionStatus }) {
    state.connectionStatus = connectionStatus
  },
  updatePrivateKeyPath (state, { privateKeyPath }) {
    state.privateKeyPath = privateKeyPath
  }
}

const actions = {
  updateConnectionStatus ({ commit }, { connectionStatus }) {
    commit('updateConnectionStatus', { connectionStatus })
  },
  updatePrivateKeyPath ({ commit }, { privateKeyPath }) {
    commit('updatePrivateKeyPath', { privateKeyPath })
  }
}

export default {
  state,
  mutations,
  actions
}
