import { Protection, ProtectionProvider } from "./../interfaces/umbrella.i";
import Vue from "vue";
import Web3 from "web3";
import Vuex, { Commit, Dispatch } from "vuex";
import { getInstance } from "@snapshot-labs/lock/plugins/vue";
import { Web3Provider } from "@ethersproject/providers";
import { formatUnits } from "@ethersproject/units";
import { stateSave, stateLoad, stateDestroy, getERC20Contract, getBalance, waitTransaction, approve } from "@/utils";
import { sleep, checkConnection, getAllowance } from "./../utils/index";
import { AbiItem } from "web3-utils";
import { provider } from "web3-core";
import config from "@/config";
import store from "@/store";
import YAMContract from "@/utils/abi/yam.json";
import MetaPool from "@/utils/abi/UmbrellaMetaPool.json";
import BigNumber from "bignumber.js";

Vue.use(Vuex);

let auth;

const defaultState = () => {
  return {
    version: "A-0.1", // make dynamic
    theme: stateLoad("theme") || "light",
    account: stateLoad("account") || "0x0",
    userType: "default", // seeker, provider, arbitrer
    currentMetapool: [],
    metapools: [],
    quote: {
      metapoolId: 0, // or
      contractId: 0, // or
      price: 0,
    }, // populated with user choosing
    approvals: {},
    canWithdraw: false,

    theNewKey: null,
    approved: {
      contractA: false,
      contractB: false,
    },
    web3: {
      core: null,
      isInjected: false,
      web3Instance: null,
      network: config.networks["1"],
    },
    provider: {},
    connector: {},
  };
};

export default new Vuex.Store({
  state: defaultState(),
  mutations: {
    UPDATE(state, data) {
      Object.keys(data).forEach(key => {
        Vue.set(state, key, data[key]);
      });
      console.debug("UPDATE", state, data);
    },
    THEME(state, data) {
      state.theme = data.theme;
      console.debug("THEME", data.theme);
    },
    CONNECT() {
      console.debug("CONNECT");
    },
    RECONNECT(state, data) {
      state.account = data.account;
      console.debug("RECONNECT", data.account);
    },
    DISCONNECT(state, data) {
      Vue.prototype.$auth.logout();
      state.account = null;
      window.localStorage.removeItem("account");
      console.debug("DISCONNECT");
    },
    RESET(state, data) {
      stateDestroy();
      Object.assign(state, defaultState());
      console.debug("RESET", state);
    },
    ON_PROVIDER_LOAD(state, data) {
      console.debug("ON_PROVIDER_LOAD");
    },
    ON_PROVIDER_SUCCESS(state, data) {
      state.account = data.account;
      console.debug("ON_PROVIDER_SUCCESS", data);
    },
    ON_PROVIDER_FAILURE(state, data) {
      state.account = null;
      console.debug("ON_PROVIDER_FAILURE", data);
    },
    ON_CHAIN_CHANGED(state, data) {
      if (!config.networks[data.chainId]) {
        config.networks[data.chainId] = {
          ...config.networks["1"],
          chainId: data.chainId,
          name: "Unknown",
          network: "unknown",
        };
      }
      state.web3.network = config.networks[data.chainId];
      console.debug("ON_CHAIN_CHANGED", data);
    },
    ON_ACCOUNT_CHANGED(state, data) {
      state.account = data.account;
      console.debug("ON_ACCOUNT_CHANGED", data);
    },
    UPDATE_APPROVAL(state, data) {
      // state.contracts[data.address].approved = data.value;
      // Vue.set(state, 'approvals.' + data.identifier, data.value);
      state.approvals[data.identifier] = data.value;
      console.debug("UPDATE_APPROVAL", data);
    },

    // to sort all once finished (-camelcase reminder)
    GET_METAPOOL(state, data) {
      state.currentMetapool = data.currentMetapool;
      console.debug("GET_METAPOOL", data);
    },
    SOMETHING_NEW_TO_STORE(state, data) {
      state.theNewKey = data.theNewValue;
      console.debug("SOMETHING_NEW_TO_STORE", data);
    },
  },
  actions: {
    init: async ({ commit, dispatch }) => {
      console.debug("init");
      if (store.state.theme) {
        document.documentElement.setAttribute("data-theme", store.state.theme);
        setTimeout(() => {
          if (store.state.theme === "dark") {
            const switcher = document.querySelector("#switch") as HTMLInputElement;
            if (switcher) switcher.checked = true;
          }
        }, 500);
      }
      // setTimeout(async () => {
      //   const connector = await Vue.prototype.$auth.getConnector();
      //   if (connector) {
      //     await dispatch("connect", connector);
      //   }
      // }, 100);

      // check approved on init or check it on page related
      // store.state.approvedContract = true;

      // await dispatch('getMetapools');
      commit("UPDATE", { init: true });
    },
    updateTheme({ commit, dispatch }, payload) {
      const value = payload.theme;
      document.documentElement.setAttribute("data-theme", value);
      stateSave("theme", value);
      commit("THEME", { theme: value });
    },

    // wallet
    connect: async ({ commit, dispatch }, connector = "injected") => {
      auth = getInstance();
      await auth.login(connector);
      if (auth.provider) {
        stateSave("provider", connector);
        auth.web3 = new Web3Provider(auth.provider);
        Vue.prototype.$web3 = auth.web3;
        Vue.prototype.$provider = auth.web3.provider;
        await dispatch("loadProvider");
        console.log("Vue.prototype.$web3", Vue.prototype.$web3);
      }
    },
    disconnect: async ({ commit }) => {
      commit("DISCONNECT");
    },
    reset: async ({ commit }) => {
      commit("RESET");
    },
    loadProvider: async ({ commit, dispatch }) => {
      commit("ON_PROVIDER_LOAD");
      try {
        if (auth.provider.removeAllListeners) auth.provider.removeAllListeners();
        if (auth.provider.on) {
          auth.provider.on("chainChanged", async chainId => {
            commit("ON_CHAIN_CHANGED", { chainId: parseInt(formatUnits(chainId, 0)) });
            // await dispatch('getYamBalance');
          });
          auth.provider.on("accountsChanged", async accounts => {
            if (accounts.length !== 0) {
              const account = accounts.length > 0 ? accounts[0] : null;
              commit("ON_ACCOUNT_CHANGED", { account });
              stateSave("account", account);
              await dispatch("loadProvider");
            }
          });
          // auth.provider.on('disconnect', async () => {
          //   commit('CLOSE_MODAL');
          // });
        }
        const [network, accounts] = await Promise.all([auth.web3.getNetwork(), auth.web3.listAccounts()]);
        commit("ON_CHAIN_CHANGED", { chainId: network.chainId });
        const account = accounts.length > 0 ? accounts[0] : null;
        commit("ON_PROVIDER_SUCCESS", { account });
        stateSave("account", account);
      } catch (e) {
        commit("ON_PROVIDER_FAILURE", { e });
        return Promise.reject();
      }
    },

    // contracts
    getYamBalance: async ({ commit, dispatch }) => {
      // checkConnection({ commit, dispatch });
      await sleep(500);
      if (!Vue.prototype.$web3) {
        await dispatch("connect");
      }
      // console.log("Vue.prototype.$web3", Vue.prototype.$web3);
      const yamv3 = "0x0AaCfbeC6a24756c20D41914F2caba817C0d8521";
      const balance = await getBalance(Vue.prototype.$provider, yamv3, store.state.account);
      return balance;
    },
    // ========== MetaPool stuff ========
    // updateApprovals: ({ commit, dispatch }, payload: { userAddress: string, spenderAddress: string, tokenAddress: string }) => {
    updateApprovals: async ({ commit, dispatch }, payload: { spenderAddress: string; tokenAddress: string }) => {
      try {
        const result = await approve(store.state.account, payload.spenderAddress, payload.tokenAddress, Vue.prototype.$provider);
        commit("UPDATE", { approvals: { payToken: result } });
      } catch (e) {
        commit("UPDATE", { approvals: { payToken: true } });
        console.log("bad approval");
      }
    },

    getMetaPool: ({ commit, dispatch }, payload: { address: string }) => {
      const web3 = new Web3(Vue.prototype.$provider);
      const metapoolContract = new web3.eth.Contract((MetaPool.abi as unknown) as AbiItem, payload.address);
      commit("GET_METAPOOL", { currentMetapool: metapoolContract });
      return metapoolContract;
    },

    checkContractApprovals: async ({ commit, dispatch }) => {
      return store.state.approvals;
    },

    fetchContractApproval: async ({ commit, dispatch }, payload: { identifier: string; spenderAddress: string; tokenAddress: string }) => {
      await sleep(500);
      if (!Vue.prototype.$web3) {
        await dispatch("connect");
      }
      const result = await getAllowance(store.state.account, payload.spenderAddress, payload.tokenAddress, Vue.prototype.$provider);
      console.debug("allowance", payload.spenderAddress, payload.tokenAddress, result);
      if (Number(result) > 0) {
        commit("UPDATE_APPROVAL", { identifier: payload.identifier, value: true });
      } else {
        commit("UPDATE_APPROVAL", { identifier: payload.identifier, value: false });
      }
      return result;
    },
    getContractApproval: async ({ commit, dispatch }, payload: { identifier: string; spenderAddress: string; tokenAddress: string }) => {
      await sleep(500);
      if (!Vue.prototype.$web3) {
        await dispatch("connect");
      }
      if (!store.state.approvals[payload.spenderAddress]) {
        await approve(store.state.account, payload.spenderAddress, payload.tokenAddress, Vue.prototype.$provider);
        await dispatch("fetchContractApproval", payload);
        return -1;
      } else {
        commit("UPDATE_APPROVAL", { identifier: payload.identifier, value: true });
        return 1;
      }
    },
    getCoveredConcepts: async ({ commit, dispatch }, payload: { metaPoolAddr: string }): Promise<string[]> => {
      // const web3 = new Web3(Vue.prototype.$provider);
      // const metapoolContract = getMetaPool(provider, metaPoolAddr);
      const metapoolContract = await dispatch("getMetaPool", { address: payload.metaPoolAddr });
      try {
        const concepts: string[] = await metapoolContract.methods.getConcepts().call();
        commit("SOMETHING_NEW_TO_STORE", { theNewKey: concepts }); // { theNewKey: theNewValue }
        // then we can request getting this value either from init either from a page
        // and we will have it stored in the state (committing it from the action, saving it with a mutation to the state)
        // which is where from we can access it globally
        return concepts;
      } catch (e) {
        return [];
      }
    },
    getConceptIndex: async ({ commit, dispatch }, payload: { metaPoolAddr: string; concept: string }): Promise<number> => {
      // const metaContract = getMetaPool(provider, metaPoolAddr);
      const metapoolContract = await dispatch("getMetaPool", { address: payload.metaPoolAddr });
      try {
        const concepts: number = await metapoolContract.methods.getConceptIndex(payload.concept).call();
        return concepts;
      } catch (e) {
        return -1;
      }
    },
    getPositionData: async ({ commit, dispatch }, payload: { metaPoolAddr: string; pid: number }): Promise<Protection> => {
      // const metaContract = getMetaPool(provider, metaPoolAddr);
      const metapoolContract = await dispatch("getMetaPool", { address: payload.metaPoolAddr });
      try {
        const info: Protection = await metapoolContract.methods.getProtectionInfo(payload.pid).call();
        return info;
      } catch (e) {
        console.error("Couldn't get protection: ", payload.pid);
        return {} as any;
      }
    },
    getProtectionIds: async ({ commit, dispatch }, payload: { metaPoolAddr: string; addr: string }): Promise<any> => {
      // const metaContract = getMetaPool(provider, metaPoolAddr);
      const metapoolContract = await dispatch("getMetaPool", { address: payload.metaPoolAddr });
      try {
        const pids: number[] = await metapoolContract.methods.getPids(payload.addr).call();
        return pids;
      } catch (e) {
        console.error("Couldn't get protection: ", e);
        return {} as any;
      }
    },
    getProviderTPS: async ({ commit, dispatch }, payload: { metaPoolAddr: string; pp: string }): Promise<string> => {
      // const metaContract = getMetaPool(provider, metaPoolAddr);
      const metapoolContract = await dispatch("getMetaPool", { address: payload.metaPoolAddr });
      try {
        const tps: string = await metapoolContract.methods.getCurrentProviderTPS(payload.pp).call();
        return tps;
      } catch (e) {
        console.error("Couldn't get provider tps: ", payload.pp);
        return {} as any;
      }
    },
    getGlobalTPS: async ({ commit, dispatch }, payload: { metaPoolAddr: string }): Promise<string> => {
      // const metaContract = getMetaPool(provider, metaPoolAddr);
      const metapoolContract = await dispatch("getMetaPool", { address: payload.metaPoolAddr });
      try {
        const tps: string = await metapoolContract.methods.currentTotalTPS().call();
        return tps;
      } catch (e) {
        console.error("Couldn't get global tps");
        return {} as any;
      }
    },
    buyProtection: async (
      { commit, dispatch },
      payload: {
        metaPoolAddr: string;
        conceptIndex: number;
        coverageAmount: string;
        duration: number;
        maxPay: string;
        deadline: number;
        onTxHash?: (txHash: string) => void;
      }
    ): Promise<boolean> => {
      try {
        // const metaContract = getMetaPool(provider, metaPoolAddr);
        const metapoolContract = await dispatch("getMetaPool", { address: payload.metaPoolAddr });
        const web3Provider = Vue.prototype.$provider;
        const ge = await metapoolContract.methods
          .buyProtection(payload.conceptIndex, payload.coverageAmount, payload.duration, payload.maxPay, payload.deadline)
          .estimateGas(
            {
              from: store.state.account,
              gas: 50000000,
            },
            async (error: any) => {
              console.log("SimTx Failed, ", error);
              return false;
            }
          );
        return metapoolContract.methods
          .buyProtection(payload.conceptIndex, payload.coverageAmount, payload.duration, payload.maxPay, payload.deadline)
          .send({ from: store.state.account, gas: ge }, async (error: any, txHash: string) => {
            if (error) {
              console.error("MetaPool could not buy protection", error);
              payload.onTxHash && payload.onTxHash("");
              return false;
            }
            if (payload.onTxHash) {
              payload.onTxHash(txHash);
            }
            const status = await waitTransaction(web3Provider, txHash);
            if (!status) {
              console.log("Buy protection transaction failed.");
              return false;
            }
            return true;
          });
      } catch (e) {
        console.error("error", e);
        return false;
      }
    },
    claim: async (
      { commit, dispatch },
      payload: {
        metaPoolAddr: string;
        pid: string;
        onTxHash?: (txHash: string) => void;
      }
    ): Promise<boolean> => {
      try {
        // const metaContract = getMetaPool(provider, metaPoolAddr);
        const metapoolContract = await dispatch("getMetaPool", { address: payload.metaPoolAddr });
        const web3Provider = Vue.prototype.$provider;
        const ge = await metapoolContract.methods.claim(payload.pid).estimateGas(
          {
            from: store.state.account,
            gas: 50000000,
          },
          async (error: any) => {
            console.log("SimTx Failed, ", error);
            return false;
          }
        );
        return metapoolContract.methods.claim(payload.pid).send({ from: store.state.account, gas: ge }, async (error: any, txHash: string) => {
          if (error) {
            console.error("MetaPool could not claim", error);
            payload.onTxHash && payload.onTxHash("");
            return false;
          }
          if (payload.onTxHash) {
            payload.onTxHash(txHash);
          }
          const status = await waitTransaction(web3Provider, txHash);
          if (!status) {
            console.log("Claim transaction failed.");
            return false;
          }
          return true;
        });
      } catch (e) {
        console.error("error", e);
        return false;
      }
    },
    transferProtection: async (
      { commit, dispatch },
      payload: {
        metaPoolAddr: string;
        userAddress: string;
        toAddress: string;
        onTxHash?: (txHash: string) => void;
      }
    ): Promise<boolean> => {
      try {
        // const metaContract = getMetaPool(provider, metaPoolAddr);
        const metapoolContract = await dispatch("getMetaPool", { address: payload.metaPoolAddr });
        const web3Provider = Vue.prototype.$provider;
        return metapoolContract.methods
          .transfer(payload.toAddress)
          .send({ from: store.state.account, gas: 280000 }, async (error: any, txHash: string) => {
            if (error) {
              console.error("MetaPool could not transfer protection", error);
              payload.onTxHash && payload.onTxHash("");
              return false;
            }
            if (payload.onTxHash) {
              payload.onTxHash(txHash);
            }
            const status = await waitTransaction(web3Provider, txHash);
            if (!status) {
              console.log("Transfer transaction failed.");
              return false;
            }
            return true;
          });
      } catch (e) {
        console.error("error", e);
        return false;
      }
    },
    metaSetApprovalAl: async (
      { commit, dispatch },
      payload: {
        metaPoolAddr: string;
        userAddress: string;
        operatorAddr: string;
        approved: boolean;
        onTxHash?: (txHash: string) => void;
      }
    ): Promise<boolean> => {
      try {
        // const metaContract = getMetaPool(provider, metaPoolAddr);
        const metapoolContract = await dispatch("getMetaPool", { address: payload.metaPoolAddr });
        const web3Provider = Vue.prototype.$provider;
        return metapoolContract.methods
          .setApprovalForAll(payload.operatorAddr, payload.approved)
          .send({ from: store.state.account, gas: 280000 }, async (error: any, txHash: string) => {
            if (error) {
              console.error("MetaPool could not transfer protection", error);
              payload.onTxHash && payload.onTxHash("");
              return false;
            }
            if (payload.onTxHash) {
              payload.onTxHash(txHash);
            }
            const status = await waitTransaction(web3Provider, txHash);
            if (!status) {
              console.log("setApprovalForAll transaction failed.");
              return false;
            }
            return true;
          });
      } catch (e) {
        console.error("error", e);
        return false;
      }
    },
    metaSafeTransferFrom: async (
      { commit, dispatch },
      payload: {
        metaPoolAddr: string;
        userAddress: string;
        fromAddr: string;
        toAddr: string;
        pid: string;
        data: string;
        onTxHash?: (txHash: string) => void;
      }
    ): Promise<boolean> => {
      try {
        // const metaContract = getMetaPool(provider, metaPoolAddr);
        const metapoolContract = await dispatch("getMetaPool", { address: payload.metaPoolAddr });
        const web3Provider = Vue.prototype.$provider;
        return metapoolContract.methods
          .safeTransferFrom(payload.fromAddr, payload.toAddr, payload.pid, payload.data)
          .send({ from: store.state.account, gas: 280000 }, async (error: any, txHash: string) => {
            if (error) {
              console.error("MetaPool could not transfer protection", error);
              payload.onTxHash && payload.onTxHash("");
              return false;
            }
            if (payload.onTxHash) {
              payload.onTxHash(txHash);
            }
            const status = await waitTransaction(web3Provider, txHash);
            if (!status) {
              console.log("setApprovalForAll transaction failed.");
              return false;
            }
            return true;
          });
      } catch (e) {
        console.error("error", e);
        return false;
      }
    },
    provideCoverage: async (
      { commit, dispatch },
      payload: {
        metaPoolAddr: string;
        amount: string;
        onTxHash?: (txHash: string) => void;
      }
    ): Promise<boolean> => {
      try {
        // const metaContract = getMetaPool(provider, metaPoolAddr);
        const metapoolContract = await dispatch("getMetaPool", { address: payload.metaPoolAddr });
        const web3Provider = Vue.prototype.$provider;
        const ge = await metapoolContract.methods.provideCoverage(payload.amount).estimateGas(
          {
            from: store.state.account,
            gas: 50000000,
          },
          async (error: any) => {
            console.log("SimTx Failed, ", error);
            return false;
          }
        );
        return metapoolContract.methods
          .provideCoverage(payload.amount)
          .send({ from: store.state.account, gas: ge }, async (error: any, txHash: string) => {
            if (error) {
              console.error("MetaPool could not provide coverage", error);
              payload.onTxHash && payload.onTxHash("");
              return false;
            }
            if (payload.onTxHash) {
              payload.onTxHash(txHash);
            }
            const status = await waitTransaction(web3Provider, txHash);
            if (!status) {
              console.log("provideCoverage transaction failed.");
              return false;
            }
            return true;
          });
      } catch (e) {
        console.error("error", e);
        return false;
      }
    },
    initiateWithdraw: async (
      { commit, dispatch },
      payload: {
        metaPoolAddr: string;
        onTxHash?: (txHash: string) => void;
      }
    ): Promise<boolean> => {
      try {
        // const metaContract = getMetaPool(provider, metaPoolAddr);
        const metapoolContract = await dispatch("getMetaPool", { address: payload.metaPoolAddr });
        const web3Provider = Vue.prototype.$provider;
        return metapoolContract.methods.initiateWithdraw().send({ from: store.state.account, gas: 80000 }, async (error: any, txHash: string) => {
          if (error) {
            console.error("MetaPool could not initiate withdraw", error);
            payload.onTxHash && payload.onTxHash("");
            return false;
          }
          if (payload.onTxHash) {
            payload.onTxHash(txHash);
          }
          const status = await waitTransaction(web3Provider, txHash);
          if (!status) {
            console.log("Initiate withdraw transaction failed.");
            return false;
          }
          return true;
        });
      } catch (e) {
        console.error("error", e);
        return false;
      }
    },
    getUserPayTokenBalance: async ({ commit, dispatch }, paytoken: string) => {
      await sleep(500);
      if (!Vue.prototype.$web3) {
        await dispatch("connect");
      }
      const balance = await getBalance(Vue.prototype.$provider, paytoken, store.state.account);
      return balance;
    },
    withdraw: async (
      { commit, dispatch },
      payload: {
        metaPoolAddr: string;
        userAddress: string;
        amount: string;
        onTxHash?: (txHash: string) => void;
      }
    ): Promise<boolean> => {
      try {
        // const metaContract = getMetaPool(provider, metaPoolAddr);
        const metapoolContract = await dispatch("getMetaPool", { address: payload.metaPoolAddr });
        const web3Provider = Vue.prototype.$provider;
        return metapoolContract.methods
          .withdraw(payload.amount)
          .send({ from: store.state.account, gas: 480000 }, async (error: any, txHash: string) => {
            if (error) {
              console.error("MetaPool could not withdraw", error);
              payload.onTxHash && payload.onTxHash("");
              return false;
            }
            if (payload.onTxHash) {
              payload.onTxHash(txHash);
            }
            const status = await waitTransaction(web3Provider, txHash);
            if (!status) {
              console.log("Withdraw transaction failed.");
              return false;
            }
            return true;
          });
      } catch (e) {
        console.error("error", e);
        return false;
      }
    },
    claimPremiums: async (
      { commit, dispatch },
      payload: {
        metaPoolAddr: string;
        userAddress: string;
        onTxHash?: (txHash: string) => void;
      }
    ): Promise<boolean> => {
      try {
        // const metaContract = getMetaPool(provider, metaPoolAddr);
        const metapoolContract = await dispatch("getMetaPool", { address: payload.metaPoolAddr });
        const web3Provider = Vue.prototype.$provider;
        return metapoolContract.methods.claimPremiums().send({ from: store.state.account, gas: 480000 }, async (error: any, txHash: string) => {
          if (error) {
            console.error("MetaPool could not withdraw", error);
            payload.onTxHash && payload.onTxHash("");
            return false;
          }
          if (payload.onTxHash) {
            payload.onTxHash(txHash);
          }
          const status = await waitTransaction(web3Provider, txHash);
          if (!status) {
            console.log("Withdraw transaction failed.");
            return false;
          }
          return true;
        });
      } catch (e) {
        console.error("error", e);
        return false;
      }
    },
    sweepPremiums: async (
      { commit, dispatch },
      payload: {
        metaPoolAddr: string;
        userAddress: string;
        pids: string[];
        onTxHash?: (txHash: string) => void;
      }
    ): Promise<boolean> => {
      try {
        // const metaContract = getMetaPool(provider, metaPoolAddr);
        const metapoolContract = await dispatch("getMetaPool", { address: payload.metaPoolAddr });
        const web3Provider = Vue.prototype.$provider;
        return metapoolContract.methods
          .sweepPremiums(payload.pids)
          .send({ from: store.state.account, gas: 1480000 }, async (error: any, txHash: string) => {
            if (error) {
              console.error("MetaPool could not sweep premiums", error);
              payload.onTxHash && payload.onTxHash("");
              return false;
            }
            if (payload.onTxHash) {
              payload.onTxHash(txHash);
            }
            const status = await waitTransaction(web3Provider, txHash);
            if (!status) {
              console.log("Sweep multiple transaction failed.");
              return false;
            }
            return true;
          });
      } catch (e) {
        console.error("error", e);
        return false;
      }
    },
    sweep: async (
      { commit, dispatch },
      payload: {
        metaPoolAddr: string;
        userAddress: string;
        pid: string;
        onTxHash?: (txHash: string) => void;
      }
    ): Promise<boolean> => {
      try {
        // const metaContract = getMetaPool(provider, metaPoolAddr);
        const metapoolContract = await dispatch("getMetaPool", { address: payload.metaPoolAddr });
        const web3Provider = Vue.prototype.$provider;
        return metapoolContract.methods.sweep(payload.pid).send({ from: store.state.account, gas: 380000 }, async (error: any, txHash: string) => {
          if (error) {
            console.error("MetaPool could not sweep premium", error);
            payload.onTxHash && payload.onTxHash("");
            return false;
          }
          if (payload.onTxHash) {
            payload.onTxHash(txHash);
          }
          const status = await waitTransaction(web3Provider, txHash);
          if (!status) {
            console.log("Sweep transaction failed.");
            return false;
          }
          return true;
        });
      } catch (e) {
        console.error("error", e);
        return false;
      }
    },
    getProviderBalance: async (
      { commit, dispatch },
      payload: {
        metaPoolAddr: string;
        providerAddr: string;
      }
    ): Promise<string> => {
      // const metaContract = getMetaPool(provider, metaPoolAddr);
      const metapoolContract = await dispatch("getMetaPool", { address: payload.metaPoolAddr });
      try {
        const bal: string = await metapoolContract.methods.balanceOf(payload.providerAddr).call();
        return bal;
      } catch (e) {
        console.error("Couldn't get provider bal");
        return "0";
      }
    },
    getProviderWithdrawTime: async (
      { commit, dispatch },
      payload: {
        metaPoolAddr: string;
        providerAddr: string;
      }
    ): Promise<number> => {
      // const metaContract = getMetaPool(provider, metaPoolAddr);
      const metapoolContract = await dispatch("getMetaPool", { address: payload.metaPoolAddr });
      const web3Provider = Vue.prototype.$provider;
      // dont think we need "provider: provider" nor "web3Provider" since provider -> down below is something else, so removed from Alpha.vue l.156
      try {
        const provider: ProtectionProvider = await metapoolContract.methods.providers(payload.providerAddr).call();
        return provider.withdrawInitiated;
      } catch (e) {
        console.error("Couldn't get getProviderWithdrawTime");
        return 0;
      }
    },
    canWithdrawCheck: async (
      { commit, dispatch },
      payload: {
        metaPoolAddr: string;
        providerAddr: string;
      }
    ): Promise<boolean> => {
      // const withdrawInitiatedTime: number = await getProviderWithdrawTime(provider, payload.metaPoolAddr, payload.providerAddr);
      const withdrawInitiatedTime = await dispatch("getProviderWithdrawTime", {
        metaPoolAddr: payload.metaPoolAddr,
        providerAddr: payload.providerAddr,
      });
      const seconds = new Date().getTime() / 1000;
      let result;
      if (seconds > withdrawInitiatedTime) {
        const delta = seconds - withdrawInitiatedTime;
        if (delta > 86400 * 7 && delta <= 86400 * 14) {
          result = true;
        }
      }
      result = false;
      commit("UPDATE", { canWithdraw: result });
      return result;
    },
    getPrice: async (
      { commit, dispatch },
      payload: {
        metaPoolAddr: string;
        coverage: string;
        duration: string;
      }
    ): Promise<string> => {
      // const metaContract = getMetaPool(provider, metaPoolAddr);
      const metapoolContract = await dispatch("getMetaPool", { address: payload.metaPoolAddr });
      try {
        const price: string = await metapoolContract.methods.currentPrice(payload.coverage, payload.duration).call();
        return price;
      } catch (e) {
        console.error("Couldn't get price");
        return "0";
      }
    },
    getPoolInfo: async ({ commit, dispatch }, metaPoolAddr: string): Promise<any> => {
      try {
        const metapoolContract = await dispatch("getMetaPool", { address: metaPoolAddr });
        const res = await Promise.all([
          metapoolContract.methods.reserves().call(),
          metapoolContract.methods.utilized().call(),
          metapoolContract.methods.minPay().call(),
          metapoolContract.methods.description().call(),
          metapoolContract.methods.getConcepts().call(),
          metapoolContract.methods.LOCKUP_PERIOD().call(),
          metapoolContract.methods.MAX_RESERVES().call(),
          metapoolContract.methods.WITHDRAW_GRACE_PERIOD().call(),
        ]);
        return {
          reserves: new BigNumber(res[0]),
          utilized: new BigNumber(res[1]),
          minPay: new BigNumber(res[2]),
          description: res[3],
          getConcepts: res[4],
          LOCKUP_PERIOD: new BigNumber(res[5]),
          MAX_RESERVES: new BigNumber(res[6]),
          WITHDRAW_GRACE_PERIOD: new BigNumber(res[7]),
        };
      } catch (e) {
        console.error("Couldn't get pool info,", e);
      }
    },
    getPayoutToken: async (
      { commit, dispatch },
      payload: {
        metaPoolAddr: string;
      }
    ): Promise<string> => {
      // const metaContract = getMetaPool(provider, metaPoolAddr);
      const metapoolContract = await dispatch("getMetaPool", { address: payload.metaPoolAddr });
      try {
        const tokenAddr: string = await metapoolContract.methods.payToken().call();
        return tokenAddr;
      } catch (e) {
        console.error("Couldn't get payToken");
        return "0";
      }
    },
    getClaimablePremiums: async (
      { commit, dispatch },
      payload: {
        metaPoolAddr: string;
        providerAddr: string;
      }
    ): Promise<string> => {
      // const metaContract = getMetaPool(provider, metaPoolAddr);
      const metapoolContract = await dispatch("getMetaPool", { address: payload.metaPoolAddr });
      try {
        const premiums: string = await metapoolContract.methods.claimablePremiums(payload.providerAddr).call();
        return premiums;
      } catch (e) {
        console.error("Couldn't get provider claimable premiums");
        return "0";
      }
    },
    getReserves: async (
      { commit, dispatch },
      payload: {
        metaPoolAddr: string;
      }
    ): Promise<string> => {
      // const metaContract = getMetaPool(provider, metaPoolAddr);
      const metapoolContract = await dispatch("getMetaPool", { address: payload.metaPoolAddr });
      try {
        const reserves: string = await metapoolContract.methods.reserves().call();
        return reserves;
      } catch (e) {
        console.error("Couldn't get reserves");
        return "0";
      }
    },
    getUtilized: async (
      { commit, dispatch },
      payload: {
        metaPoolAddr: string;
      }
    ): Promise<string> => {
      // const metaContract = getMetaPool(provider, metaPoolAddr);
      const metapoolContract = await dispatch("getMetaPool", { address: payload.metaPoolAddr });
      const web3Provider = Vue.prototype.$provider;
      try {
        const utilized: string = await metapoolContract.methods.utilized().call();
        return utilized;
      } catch (e) {
        console.error("Couldn't get utilized");
        return "0";
      }
    },
    getDescription: async (
      { commit, dispatch },
      payload: {
        metaPoolAddr: string;
      }
    ): Promise<string> => {
      // const metaContract = getMetaPool(provider, metaPoolAddr);
      const metapoolContract = await dispatch("getMetaPool", { address: payload.metaPoolAddr });
      const web3Provider = Vue.prototype.$provider;
      try {
        const description: string = await metapoolContract.methods.description().call();
        return description;
      } catch (e) {
        console.error("Couldn't get description");
        return "";
      }
    },

    // arbiter functions
    enterCooldown: async (
      { commit, dispatch },
      payload: {
        metaPoolAddr: string;
        userAddress: string;
        index: string;
        onTxHash?: (txHash: string) => void;
      }
    ): Promise<boolean> => {
      try {
        // const metaContract = getMetaPool(provider, metaPoolAddr);
        const metapoolContract = await dispatch("getMetaPool", { address: payload.metaPoolAddr });
        const web3Provider = Vue.prototype.$provider;
        return metapoolContract.methods
          .enterCooldown(payload.index)
          .send({ from: store.state.account, gas: 380000 }, async (error: any, txHash: string) => {
            if (error) {
              console.error("MetaPool could not enter cooldown", error);
              payload.onTxHash && payload.onTxHash("");
              return false;
            }
            if (payload.onTxHash) {
              payload.onTxHash(txHash);
            }
            const status = await waitTransaction(web3Provider, txHash);
            if (!status) {
              console.log("Enter Cooldown transaction failed.");
              return false;
            }
            return true;
          });
      } catch (e) {
        console.error("error", e);
        return false;
      }
    },
    reactivateConcept: async (
      { commit, dispatch },
      payload: {
        metaPoolAddr: string;
        userAddress: string;
        index: string;
        onTxHash?: (txHash: string) => void;
      }
    ): Promise<boolean> => {
      try {
        // const metaContract = getMetaPool(provider, metaPoolAddr);
        const metapoolContract = await dispatch("getMetaPool", { address: payload.metaPoolAddr });
        const web3Provider = Vue.prototype.$provider;
        return metapoolContract.methods
          .reactivateConcept(payload.index)
          .send({ from: store.state.account, gas: 380000 }, async (error: any, txHash: string) => {
            if (error) {
              console.error("MetaPool could not reactivateConcept", error);
              payload.onTxHash && payload.onTxHash("");
              return false;
            }
            if (payload.onTxHash) {
              payload.onTxHash(txHash);
            }
            const status = await waitTransaction(web3Provider, txHash);
            if (!status) {
              console.log("reactivateConcept transaction failed.");
              return false;
            }
            return true;
          });
      } catch (e) {
        console.error("error", e);
        return false;
      }
    },
    setSettling: async (
      { commit, dispatch },
      payload: {
        metaPoolAddr: string;
        userAddress: string;
        index: string;
        onTxHash?: (txHash: string) => void;
      }
    ): Promise<boolean> => {
      try {
        // const metaContract = getMetaPool(provider, metaPoolAddr);
        const metapoolContract = await dispatch("getMetaPool", { address: payload.metaPoolAddr });
        const web3Provider = Vue.prototype.$provider;
        return metapoolContract.methods
          ._setSettling(payload.index)
          .send({ from: store.state.account, gas: 580000 }, async (error: any, txHash: string) => {
            if (error) {
              console.error("MetaPool could not _setSettling", error);
              payload.onTxHash && payload.onTxHash("");
              return false;
            }
            if (payload.onTxHash) {
              payload.onTxHash(txHash);
            }
            const status = await waitTransaction(web3Provider, txHash);
            if (!status) {
              console.log("Set settling transaction failed.");
              return false;
            }
            return true;
          });
      } catch (e) {
        console.error("error", e);
        return false;
      }
    },
    claimArbiterFees: async (
      { commit, dispatch },
      payload: {
        metaPoolAddr: string;
        userAddress: string;
        onTxHash?: (txHash: string) => void;
      }
    ): Promise<boolean> => {
      try {
        // const metaContract = getMetaPool(provider, metaPoolAddr);
        const metapoolContract = await dispatch("getMetaPool", { address: payload.metaPoolAddr });
        const web3Provider = Vue.prototype.$provider;
        return metapoolContract.methods._getArbiterFees().send({ from: store.state.account, gas: 580000 }, async (error: any, txHash: string) => {
          if (error) {
            console.error("MetaPool could not _getArbiterFees", error);
            payload.onTxHash && payload.onTxHash("");
            return false;
          }
          if (payload.onTxHash) {
            payload.onTxHash(txHash);
          }
          const status = await waitTransaction(web3Provider, txHash);
          if (!status) {
            console.log("_getArbiterFees transaction failed.");
            return false;
          }
          return true;
        });
      } catch (e) {
        console.error("error", e);
        return false;
      }
    },

    // getMetapools: async ({ commit }) => {
    //   let metapools;
    //   commit('UPDATE', { metapools });
    //   return metapools;
    // },
    // getMetapoolContract: async ({ commit }, { metapoolId }) => {
    //   let contract;
    //   commit('UPDATE', { selectedContract });
    //   return contract;
    // },
  },
  getters: {
    theme(state) {
      return state.theme;
    },
    account(state) {
      return state.account;
    },
    async connected(state) {
      const isAuthenticated = await Vue.prototype.$auth.isAuthenticated;
      return state.account && state.account !== null && isAuthenticated;
    },
    async connector() {
      const auth = await Vue.prototype.$auth;
      const connector = await auth.getConnector();
      return connector; // move to state
    },
  },
});

store.dispatch("init");
