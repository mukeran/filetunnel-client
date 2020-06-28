const state = {
  uid: null,
  username: null
}

const mutations = {
  updateUserInfo (state, { uid, username }) {
    state.uid = uid
    state.username = username
  }
}

export default {
  state,
  mutations
}
