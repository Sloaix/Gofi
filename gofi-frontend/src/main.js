// ie polyfill
import '@babel/polyfill'

import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store/'
import { VueAxios } from './utils/request'
import i18n from './locales'
// mock
import './mock'

import bootstrap from './core/bootstrap'
import './core/use'
import './navigation-guards' // navigation guards
import './utils/filter' // global filter

Vue.config.productionTip = false

// mount axios Vue.$http and this.$http
Vue.use(VueAxios)

new Vue({
  i18n,
  router,
  store,
  created: bootstrap,
  render: h => h(App)
}).$mount('#app')
