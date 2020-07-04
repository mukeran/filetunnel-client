import status from '../../../client/status'

const state = {
  connectionStatus: status.connection.DISCONNECTED,
  transferPort: 0,
  privateKeyPath: '',
  enableCompression: true,
  enableEncryption: true,
  acceptOfflineTransfer: true,
  enableP2PTransfer: true
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
  },
  updateEnableCompression (state, { enableCompression }) {
    state.enableCompression = enableCompression
  },
  updateEnableEncryption (state, { enableEncryption }) {
    state.enableEncryption = enableEncryption
  },
  updateAcceptOfflineTransfer (state, { acceptOfflineTransfer }) {
    state.acceptOfflineTransfer = acceptOfflineTransfer
  },
  updateEnableP2PTransfer (state, { enableP2PTransfer }) {
    state.enableP2PTransfer = enableP2PTransfer
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
  },
  updateEnableCompression ({ commit }, { enableCompression }) {
    commit('updateEnableCompression', { enableCompression })
  },
  updateEnableEncryption ({ commit }, { enableEncryption }) {
    commit('updateEnableEncryption', { enableEncryption })
  },
  updateAcceptOfflineTransfer ({ commit }, { acceptOfflineTransfer }) {
    commit('updateAcceptOfflineTransfer', { acceptOfflineTransfer })
  },
  updateEnableP2PTransfer ({ commit }, { enableP2PTransfer }) {
    commit('updateEnableP2PTransfer', { enableP2PTransfer })
  },
  clearSession ({ dispatch }) {
    dispatch('updateFriendList', { friends: [] })
    dispatch('updateFriendRequests', { friendRequests: [] })
    dispatch('updateOfflineTransfers', { offlineTransfers: [] })
  }
}

export default {
  state,
  mutations,
  actions
}
