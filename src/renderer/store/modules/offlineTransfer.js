import status from '../../../client/status'

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
  },
  removeOfflineTransfer (state, _id) {
    state.offlineTransfers = state.offlineTransfers.filter(offlineTransfer => offlineTransfer._id !== _id)
  },
  setOfflineTransferAccepted (state, _id) {
    state.offlineTransfers = state.offlineTransfers.map(offlineTransfer => {
      if (offlineTransfer._id === _id) {
        return {
          ...offlineTransfer,
          status: status.offlineTransfer.ACCEPTED
        }
      }
      return offlineTransfer
    })
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
  },
  removeOfflineTransfer ({ commit }, _id) {
    commit('removeOfflineTransfer', _id)
  },
  setOfflineTransferAccepted ({ commit }, _id) {
    commit('setOfflineTransferAccepted', _id)
  }
}

export default {
  state,
  mutations,
  actions
}
