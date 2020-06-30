import Vue from 'vue'
import Router from 'vue-router'

import LandingPage from '../components/LandingPage'
import Login from '../components/Login'
import Register from '../components/Register'
import Dashboard from '../components/Dashboard'
import FriendList from '../components/FriendList'
import MessageList from '../components/TransferList'
import Settings from '../components/Settings'
import SettingsUserSecurity from '../components/Settings/User/Security'
import SettingsUserPrivacy from '../components/Settings/User/Privacy'
import SettingsTransferUniversal from '../components/Settings/Transfer/Universal'

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
      path: '/register',
      name: 'Register',
      component: Register
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
          path: '/settings',
          name: 'Settings',
          component: Settings,
          children: [
            {
              path: 'user/security',
              name: 'SettingsUserSecurity',
              component: SettingsUserSecurity
            },
            {
              path: 'user/privacy',
              name: 'SettingsUserPrivacy',
              component: SettingsUserPrivacy
            },
            {
              path: 'transfer/universal',
              name: 'SettingsTransferUniversal',
              component: SettingsTransferUniversal
            }
          ]
        }
      ]
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
