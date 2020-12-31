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
        <h2>Buy Coverage</h2>
        <div class="dropdown">
          <vue-picker class="select" v-model="protocolSelected" placeholder="Select Protocol" autofocus>
            <vue-picker-option value="">Select Protocol</vue-picker-option>
            <vue-picker-option value="DYDX">dYdX</vue-picker-option>
            <vue-picker-option value="COMPOUND">Compound</vue-picker-option>
            <vue-picker-option value="AAVE">Aave</vue-picker-option>
          </vue-picker>
        </div>
        <div>
          <label>Coverage Amount: </label>
          <input v-model="coverage" placeholder="0 DAI" />
        </div>
        <div>
          <label>Duration: </label>
          <input v-model="duration" placeholder="0 Days" />
        </div>
        <div>
          <span>Price: {{ this.price }}</span>
        </div>
        <!-- Need to check approval on payToken for metapool -->
        <Button v-if="!$store.state.approvals.payToken" @click.native="payTokenApprove">Approve to Buy Coverage</Button>
        <Button v-if="$store.state.approvals.payToken" @click.native="buyCoverage">Buy Coverage</Button>
      </Card>
      <Space size="md" />
      <Card>
        <h2>Provide Coverage</h2>
        <div>
          <label>Coverage Amount: </label>
          <input v-model="provideCoverage" />
        </div>
        <p>Liquidity is locked for at least 1 week</p>
        <!-- Need to check approval on payToken for metapool -->
        <Button v-if="!$store.state.approvals.payToken" @click.native="payTokenApprove">Approve to Provide Coverage</Button>
        <Button v-if="$store.state.approvals.payToken" @click.native="provideCoverageMake">Provide Coverage</Button>
      </Card>
      <Space size="md" />

      <!-- We need to check if the user has initiated a withdraw. we have `canWithdrawCheck function we can call` -->
      <!-- moved canWithdraw on button, check will happen and the button will only show if the user is able to withdraw, check l.156 -->
      <Card>
        <h2>Withdraw Coverage</h2>
        <div>
          <label>Withdraw Amount: </label>
          <input v-model="withdrawCoverage" />
        </div>
        <p>Withdraws are timelocked for 1 week to allow arbiters to act in case of a hack.</p>
        <p>You must initiate a withdraw and wait the necessary time</p>
        <Button @click.native="withdrawInitiate">Initiate Withdraw</Button>
        <Button v-if="canWithdraw" @click.native="withdraw">Withdraw</Button>
      </Card>

      <br />
      <br />
      <Space size="md" />
      <Button v-if="$auth.isAuthenticated" @click.native="logout">Disconnect Wallet</Button>
      <br />
      <Button @click.native="resetInstance">Reset Instance</Button>
    </Container>
  </div>
</template>

<style lang="scss" scoped>
.dropdown {
  border-radius: 0px 0px 10px 10px;

  .select {
    background: #e3c0ff;
  }
}

button {
  cursor: pointer;
  // border-radius: 10px;
  border: none;
  height: 50px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.1s linear;
  color: var(--primary);
  background: var(--back-act);
  border-bottom: 2px solid #00000017;

  &.active,
  &:hover {
    color: #fff;
    background: var(--primary);
  }

  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>

<script>
import store from "@/store";
import { mapActions } from "vuex";
import BigNumber from "bignumber.js";

export default {
  name: "Alpha",
  data() {
    return {
      metapool: [],
      canWithdraw: false,
      quoteCoverageSeeker: {},
      quoteCoverageProvider: {},
      approvals: {
        payToken: false,
      },
      price: "0",
      provideCoverage: "0",
      coverage: "0",
      duration: "0",
      withdrawCoverage: "0",
      alphaContract: "0x6b175474e89094c44da98b954eedeac495271d0f",
      payToken: "0x6b175474e89094c44da98b954eedeac495271d0f",
      connector: "none",
      yamBalance: 0,
      protocolSelected: null,
    };
  },
  head: {
    title: "Alpha",
  },
  components: {},
  methods: {
    ...mapActions(["disconnect", "reset", "getYamBalance", "updateApprovals", "getMetaPool", "getPrice", "canWithdrawCheck", "buyProtection"]),
    async getConnector() {
      this.connector = await store.getters.connector;
    },
    async getBalance() {
      this.yamBalance = new BigNumber(await this.getYamBalance()).dividedBy(new BigNumber(10).pow(18));
      console.log("store.state.currentMetapool", store.state.currentMetapool);
    },
    async logout() {
      await this.disconnect();
    },
    async resetInstance() {
      await this.disconnect();
      await this.reset();
    },

    // test
    async payTokenApprove() {
      await this.updateApprovals({ spenderAddress: this.alphaContract, tokenAddress: this.payToken });
    },
    async getMetaPoolData() {
      this.metapool = await this.getMetaPool({ address: "0x9Ebc8AD4011C7f559743Eb25705CCF5A9B58D0bc" });
      // deconstruct whatever from this.metapool here
      console.log("this.metapool", this.metapool);
      console.log("store.state.currentMetapool", store.state.currentMetapool);
    },
    async getPriceCoverage() {
      console.log("getPriceCoverage");
      this.price = new BigNumber(
        await this.getPrice({ metaPoolAddr: this.alphaContract, coverage: this.coverage, duration: this.duration })
      ).dividedBy(new BigNumber(10).pow(18));
    },
    buyCoverage() {
      console.log("buyCoverage");
      this.buyProtection({ metaPoolAddr: this.alphaContract, coverage: this.coverage, duration: this.duration });
    },
    provideCoverageMake() {
      console.log("provideCoverageMake");
    },
    async canWithdrawCheckResult() {
      this.canWithdraw = store.state.canWithdraw;
      // or direct check the store on the html v-if="$store.state.canWithdraw"
      // while initiating the check elsewhere on another user action, will automatically update it
      // example: await this.canWithdrawCheck({ metaPoolAddr: this.alphaContract, providerAddr: "0x0000000....." });
      console.log("canWithdrawCheckResult");
    },
    withdrawInitiate() {
      console.log("withdrawInitiate");
    },
    withdraw() {
      console.log("withdraw");
    },
  },
  mounted() {
    this.getConnector();
    this.getBalance();

    // this.payTokenApprovalCheck();
    this.getMetaPoolData();
    this.getPriceCoverage();
    this.canWithdrawCheckResult();
  },
};
</script>
