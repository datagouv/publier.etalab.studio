import Vue from 'vue';
import Vuex from 'vuex';
import { BootstrapVue } from 'bootstrap-vue';
import Loading from 'vue-loading-overlay';
import { Icon } from 'leaflet'
import { LMap, LTileLayer, LMarker, LTooltip } from 'vue2-leaflet'
import VueSimpleSuggest from 'vue-simple-suggest';

import axios from 'axios';
import VueAxios from 'vue-axios';
import router from './router';
import App from './App.vue';

import store from './store';

import 'vue-loading-overlay/dist/vue-loading.css';

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import 'vue-simple-suggest/dist/styles.css';
import 'leaflet/dist/leaflet.css'

import VueClipboard from 'vue-clipboard2'

import '@gouvfr/dsfr/dist/dsfr.min.css';
import '@gouvfr/dsfr/dist/dsfr.module.min.js';

import './static/css/custom.css';
import i18n from './i18n'

delete Icon.Default.prototype._getIconUrl
Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
})


Vue.config.productionTip = false;
Vue.use(VueAxios, axios);
Vue.use(BootstrapVue);
Vue.use(Loading);
Vue.use(Vuex);
Vue.use(VueClipboard);

Vue.component('vue-simple-suggest', VueSimpleSuggest);

Vue.component('l-map', LMap)
Vue.component('l-tile-layer', LTileLayer)
Vue.component('l-marker', LMarker)
Vue.component('l-tooltip', LTooltip)

new Vue({
  router,
  render: (h) => h(App),
  store,

  mounted() {
    this.$store.subscribe((mutation, state) => {
      localStorage.setItem('store', JSON.stringify(state));
    });
  },

  i18n,
  beforeCreate() { this.$store.commit('initialiseStore'); }
}).$mount('#app');
