const state = {
  isConnecting: false,
  isConnected: false
}

const mutations = {
  updateConnectionStatus (state, { isConnecting, isConnected }) {
    state.isConnecting = isConnecting
    state.isConnected = isConnected
  }
}

const actions = {
  updateConnectionStatus ({ commit }, { isConnecting, isConnected }) {
    commit('updateConnectionStatus', { isConnecting, isConnected })
  }
}

export default {
  state,
  mutations,
  actions
}
