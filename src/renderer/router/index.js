import Vue from 'vue'
import Router from 'vue-router'

import LandingPage from '../components/LandingPage'
import Login from '../components/Login'
import Dashboard from '../components/Dashboard'

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
      component: Dashboard
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
