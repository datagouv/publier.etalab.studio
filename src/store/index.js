import Vue from 'vue';
import Vuex from 'vuex';

// eslint-disable-next-line import/no-cycle
import auth from './modules/auth';
import data from './modules/data';

Vue.use(Vuex);

export default new Vuex.Store({
  strict: true,
  modules: {
    auth,
    data,
  },
  mutations: {
    initialiseStore(state) {
      if (localStorage.getItem('store')) {
        this.replaceState(
          Object.assign(state, JSON.parse(localStorage.getItem('store'))),
        );
      }
    },
  },
});
