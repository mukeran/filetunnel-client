import Vue from 'vue'
import Router from 'vue-router'

import LandingPage from '../components/LandingPage'
import Login from '../components/Login'
import Dashboard from '../components/Dashboard'
import FriendList from '../components/FriendList'
import MessageList from '../components/MessageList'
import HistoryList from '../components/HistoryList'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'LandingPage',
      component: LandingPage
    },
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: Dashboard,
      children: [
        {
          path: '/friend',
          name: 'FriendList',
          component: FriendList
        },
        {
          path: '/message',
          name: 'MessageList',
          component: MessageList
        },
        {
          path: '/history',
          name: 'HistoryList',
          component: HistoryList
        }
      ]
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
