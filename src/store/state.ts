import config from "@/helpers/config";

const state = {
  account: null,
  theme: "light",
  provider: {},
  connector: {},
  web3: {
    isInjected: false,
    web3Instance: null,
    network: config.networks["1"],
  },
};

export default state;
