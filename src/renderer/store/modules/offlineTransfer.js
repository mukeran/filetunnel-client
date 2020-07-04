const state = {
  offlineTransfers: [],
  processedLength: 0,
  isOfflineTransferDataProgressVisible: false
}

const mutations = {
  updateOfflineTransfers (state, { offlineTransfers }) {
    state.offlineTransfers = offlineTransfers
  },
  updateOfflineTransferDataProgress (state, { processedLength }) {
    state.processedLength = processedLength
  },
  showOfflineTransferDataProgress (state, flag) {
    state.isOfflineTransferDataProgressVisible = flag
  }
}

const actions = {
  updateOfflineTransfers ({ commit }, { offlineTransfers }) {
    commit('updateOfflineTransfers', { offlineTransfers })
  },
  updateOfflineTransferDataProgress ({ commit }, { processedLength }) {
    commit('updateOfflineTransferDataProgress', { processedLength })
  },
  showOfflineTransferDataProgress ({ commit }, flag) {
    commit('showOfflineTransferDataProgress', flag)
  }
}

export default {
  state,
  mutations,
  actions
}
