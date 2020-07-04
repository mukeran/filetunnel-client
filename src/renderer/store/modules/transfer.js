import status from '../../../client/status'

const state = {
  transfers: [],
  _id: 1,
  active: 0
}

const mutations = {
  getId (state) {
    let id = state._id
    state._id = state._id + 1
    return id
  },
  createTransfer (state, transferTask) {
    state.transfers.push(transferTask)
    state.transfers.sort((a, b) => {
      return new Date(a.requestTime) < new Date(b.requestTime)
    })
  },
  removeTransfer (state, { _id }) {
    state.transfers = state.transfers.filter(transfer => transfer._id !== _id)
  },
  // updateHash (state, { _id, sha1, size, filename }) {
  //   let current
  //   for (let i = 0; i < state.transfers.length; i++) {
  //     if (state.transfers[i]._id === _id) {
  //       current = state.transfers[i]
  //       current.sha1 = sha1
  //       current.size = size
  //       if (current.isDownload) {
  //         current.filename = filename
  //       }
  //       break
  //     }
  //   }
  // },
  startTransfer (state, { _id }) {
    state.transfers = state.transfers.map(transfer => {
      if (transfer._id === _id) {
        return {
          ...transfer,
          status: status.transfer.TRANSFERRING,
          startTime: new Date().toISOString(),
          progress: 0,
          speed: 0
        }
      }
      return transfer
    })
  },
  updateSpeed (state, { _id, speedData }) {
    state.transfers = state.transfers.map(transfer => {
      if (transfer._id === _id) {
        return {
          ...transfer,
          progress: Math.floor(100 * speedData.transferred / speedData.total),
          speed: speedData.speed
        }
      }
      return transfer
    })
  },
  updatePath (state, { _id, filePath }) {
    state.transfers = state.transfers.map(transfer => {
      if (transfer._id === _id) {
        return {
          ...transfer,
          filePath
        }
      }
      return transfer
    })
  },
  finishTransfer (state, { _id }) {
    state.transfers = state.transfers.map(transfer => {
      if (transfer._id === _id && transfer.status === status.transfer.TRANSFERRING) {
        return {
          ...transfer,
          status: status.transfer.FINISHED,
          finishTime: new Date().toISOString()
        }
      }
      return transfer
    })
  },
  failTransfer (state, { _id }) {
    state.transfers = state.transfers.map(transfer => {
      if (transfer._id === _id && transfer.status === status.transfer.TRANSFERRING) {
        return {
          ...transfer,
          status: status.transfer.FAILED,
          failedTime: new Date().toISOString()
        }
      }
      return transfer
    })
  },
  cancelTransfer (state, { _id }) {
    state.transfers = state.transfers.map(transfer => {
      if (transfer._id === _id && transfer.status === status.transfer.TRANSFERRING) {
        return {
          ...transfer,
          status: status.transfer.CANCELLED,
          cancelTime: new Date().toISOString()
        }
      }
      return transfer
    })
  },
  rejectTransfer (state, { _id }) {
    state.transfers = state.transfers.map(transfer => {
      if (transfer._id === _id) {
        return {
          ...transfer,
          status: status.transfer.REJECTED
        }
      }
      return transfer
    })
  },
  removeAllTransfers (state) {
    state.transfers = []
  }
}

const actions = {
  getId ({ commit }) {
    return commit('getId')
  },
  createTransfer ({ commit }, transferTask) {
    commit('createTransfer', transferTask)
  },
  removeTransfer ({ commit }, { _id }) {
    commit('removeTransfer', { _id })
  },
  updateHash ({ commit }, { _id, sha1, size, filename }) {
    commit('updateHash', { _id, sha1, size, filename })
  },
  startTransfer ({ commit }, { _id }) {
    commit('startTransfer', { _id })
  },
  updateSpeed ({ commit }, { _id, speedData }) {
    commit('updateSpeed', { _id, speedData })
  },
  updatePath ({ commit }, { _id, filePath }) {
    commit('updatePath', { _id, filePath })
  },
  finishTransfer ({ commit }, { _id }) {
    commit('finishTransfer', { _id })
  },
  failTransfer ({ commit }, { _id }) {
    commit('failTransfer', { _id })
  },
  cancelTransfer ({ commit }, { _id }) {
    commit('cancelTransfer', { _id })
  },
  rejectTransfer ({ commit }, { _id }) {
    commit('rejectTransfer', { _id })
  },
  removeAllTransfers ({ commit }) {
    commit('removeAllTransfers')
  }
}

export default {
  state,
  mutations,
  actions
}
