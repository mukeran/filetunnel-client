import status from '../../../client/status'

const state = {
  transfers: [],
  _id: 1
}

const mutations = {
  getId (state) {
    let id = state._id
    state._id = state._id + 1
    return id
  },
  createTransfer (state, transferTask) {
    state.transfers.push(transferTask)
  },
  removeTransfer (state, { _id }) {
    for (let i = 0; i < state.transfers.length; i++) {
      if (state.transfers[i]._id === _id) {
        state.transfers.splice(i, 1)
        break
      }
    }
  },
  updateHash (state, { _id, sha1, size, filename }) {
    let current
    for (let i = 0; i < state.transfers.length; i++) {
      if (state.transfers[i]._id === _id) {
        current = state.transfers[i]
        current.sha1 = sha1
        current.size = size
        if (current.isDownload) {
          current.filename = filename
        }
        break
      }
    }
  },
  startTransfer (state, { _id }) {
    let current
    for (let i = 0; i < state.transfers.length; i++) {
      if (state.transfers[i]._id === _id) {
        current = state.transfers[i]
        current.status = status.transfer.TRANSFERRING
        current.startTime = new Date().toISOString()
        current.progress = 0
        current.speed = 0
        break
      }
    }
  },
  updateSpeed (state, { _id, speedData }) {
    for (let i = 0; i < state.transfers.length; i++) {
      if (state.transfers[i]._id === _id) {
        // state.transfers[i].status = status.transfer.TRANSFERRING
        state.transfers[i].progress = Math.floor(100 * speedData.transferred / speedData.total)
        state.transfers[i].speed = speedData.speed
        break
      }
    }
  },
  updatePath (state, { _id, filePath }) {
    let current
    for (let i = 0; i < state.transfers.length; i++) {
      if (state.transfers[i]._id === _id) {
        current = state.transfers[i]
        current.filePath = filePath
        break
      }
    }
  },
  finishTransfer (state, { _id }) {
    for (let i = 0; i < state.transfers.length; i++) {
      if (state.transfers[i]._id === _id) {
        state.transfers[i].status = status.transfer.FINISHED
        state.transfers[i].finishTime = new Date().toISOString()
        break
      }
    }
  },
  failTransfer (state, { _id }) {
    let current
    for (let i = 0; i < state.transfers.length; i++) {
      if (state.transfers[i]._id === _id) {
        current = state.transfers[i]
        current.status = status.transfer.FAILED
        current.failedTime = new Date().toISOString()
        break
      }
    }
  },
  cancelTransfer (state, { _id }) {
    let current
    for (let i = 0; i < state.transfers.length; i++) {
      if (state.transfers[i]._id === _id) {
        current = state.transfers[i]
        current.status = status.transfer.CANCELLED
        current.failedTime = new Date().toISOString()
        break
      }
    }
  },
  rejectTransfer (state, { _id }) {
    let current
    for (let i = 0; i < state.transfers.length; i++) {
      if (state.transfers[i]._id === _id) {
        current = state.transfers[i]
        current.status = status.transfer.REJECTED
        break
      }
    }
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
  updatePath ({ commit }, { _id, savePath }) {
    commit('updatePath', { _id, savePath })
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
  }
}

export default {
  state,
  mutations,
  actions
}
