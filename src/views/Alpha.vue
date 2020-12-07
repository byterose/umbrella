<template>
  <div class="tests">
    <Container :size="800">
      <p>Version: {{ $store.state.version }}</p>
      <p>Theme: {{ $store.state.theme }}</p>
      --
      <p>Wallet: {{ this.connector }}</p>
      <p>Account: {{ $store.state.account }}</p>
      <p>Connected: {{ $auth.isAuthenticated }}</p>
      <p>
        Balance: <b>{{ numeral("0.00a", yamBalance) }} YAM</b>
      </p>
      <Space size="md" />
      <Card>
        <p>Buy Coverage</p>
        <div>
          <label>Coverage Amount: </label>
          <input v-model="coverage" />
        </div>
        <div>
          <label>Duration: </label>
          <input v-model="duration" />
        </div>
        <div>
          <span>Price: {{ this.price }}</span>
        </div>
        <!-- Need to check approval on payToken for metapool -->
        <Button>Buy Coverage</Button>
      </Card>
      <Space size="md" />
      <Card>
        <p>Provide Coverage</p>
        <div>
          <label>Coverage Amount: </label>
          <input v-model="provideCoverage" />
        </div>
        <p>Liquidity is locked for at least 1 week</p>
        <!-- Need to check approval on payToken for metapool -->
        <Button>Provide</Button>
      </Card>
      <Space size="md" />
      <Card>
        <!-- We need to check if the user has initiated a withdraw. we have `canWithdraw function we can call` -->
        <p>Withdraw Coverage</p>
        <div>
          <label>Withdraw Amount: </label>
          <input v-model="withdrawCoverage" />
        </div>
        <p>Withdraws are timelocked for 1 week to allow arbiters to act in case of a hack.</p>
        <p>You must initiate a withdraw and wait the necessary time</p>
        <Button>Initiate Withdraw</Button>
        <!-- <Button v-if="canWithdraw(provider, metapool, coverageProvider)">Withdraw</Button> -->
        <Button>Withdraw</Button>
      </Card>
      <Space size="md" />
      <Button v-if="$auth.isAuthenticated" @click.native="logout">Disconnect Wallet</Button>
      <br />
      <Button @click.native="resetInstance">Reset Instance</Button>
    </Container>
  </div>
</template>

<style lang="scss" scoped></style>

<script>
import store from "@/store";
import { mapActions } from "vuex";
import BigNumber from "bignumber.js";

export default {
  name: "Alpha",
  data() {
    return {
      connector: "none",
      yamBalance: 0,
      price: "0",
      provideCoverage: "0",
      coverage: "0",
      duration: "0",
      withdrawCoverage: "0",
      alphaContract: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
    };
  },
  head: {
    title: "Alpha",
  },
  components: {},
  methods: {
    ...mapActions(["disconnect", "reset", "getYamBalance", "buyProtection", "getPrice", "canWithdraw"]),
    async getConnector() {
      this.connector = await store.getters.connector;
    },
    async logout() {
      await this.disconnect();
    },
    async resetInstance() {
      await this.disconnect();
      await this.reset();
    },
    // test
    async getBalance() {
      this.yamBalance = new BigNumber(await this.getYamBalance()).dividedBy(new BigNumber(10).pow(18));
    },
    async priceCoverage() {
      this.price = new BigNumber(await this.getPrice(this.alphaContract, this.coverage, this.duration)).dividedBy(new BigNumber(10).pow(18));
    },
  },
  mounted() {
    this.getConnector();
    this.getBalance();
  },
};
</script>
