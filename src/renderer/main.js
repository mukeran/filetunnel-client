/**
 * Entry of renderer process
 */
import Vue from 'vue'
import axios from 'axios'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

import App from './App'
import router from './router'
import store from './store'
import { ipcRenderer } from 'electron'
import MessageQueue from './message_queue'

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.prototype.$messageQueue = MessageQueue
Vue.config.productionTip = false
Vue.use(ElementUI)

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')

store.dispatch('failAllCurrent')

/** notification register for new P2P request */
ipcRenderer.on('message', (event, message) => {
  ElementUI.Notification(message)
})
