import status from '../../../client/status'

const state = {
  connectionStatus: status.connection.DISCONNECTED,
  transferPort: 0,
  privateKeyPath: ''
}

const mutations = {
  updateConnectionStatus (state, { connectionStatus }) {
    state.connectionStatus = connectionStatus
  },
  updatePrivateKeyPath (state, { privateKeyPath }) {
    state.privateKeyPath = privateKeyPath
  },
  updateTransferPort (state, { port }) {
    state.transferPort = port
  }
}

const actions = {
  updateConnectionStatus ({ commit }, { connectionStatus }) {
    commit('updateConnectionStatus', { connectionStatus })
  },
  updatePrivateKeyPath ({ commit }, { privateKeyPath }) {
    commit('updatePrivateKeyPath', { privateKeyPath })
  },
  updateTransferPort ({ commit }, { port }) {
    commit('updateTransferPort', { port })
  }
}

export default {
  state,
  mutations,
  actions
}
