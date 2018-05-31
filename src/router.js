import Vue from 'vue'
import Router from 'vue-router'
import MetroMap from '@/views/MetroMap'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'home',
      component: MetroMap
    },
  ]
})
