import Vue from "vue";
import Vuex from "vuex";
import state from "./state";
// import { Lock } from '@snapshot-labs/lock';
// import injected from '@snapshot-labs/lock/connectors/injected';
// import walletconnect from '@snapshot-labs/lock/connectors/walletconnect';
// import { getInstance } from '@snapshot-labs/lock/plugins/vue';

Vue.use(Vuex);
let auth;

export default new Vuex.Store({
  state: state,
  modules: {},
  mutations: {
    SetTheme(state, payload) {
      state.theme = payload;
      localStorage.setItem("theme", payload);
      document.documentElement.setAttribute("data-theme", payload);
    },
  },
  actions: {
    SetTheme(state, payload) {
      state.commit("SetTheme", payload);
    },
    // WalletLogin: async (state, payload) => {
    //   const lock = new Lock();
    //   lock.addConnector({
    //     key: 'injected',
    //     connector: injected
    //   });
    //   const connector = lock.getConnector('injected');
    //   const provider = await connector.connect('injected');
    //   state.connector = connector;
    //   state.provider = provider;
    // },
    // WalletLogout: async (state, payload) => {
    //   Vue.prototype.$auth.logout();
    //   const connector = state.connector;
    //   connector.logout();
    // },
  },
  getters: {
    theme(state) {
      return state.theme;
    },
    connector(state) {
      return state.connector;
    },
  },
});
