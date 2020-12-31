<template>
  <div class="assets">
    <Container :size="800">
      <span class="warning"
        >Warning: This is an experimental protocol — users should proceed with extreme caution. It has NOT been audited and will only exist for a few
        weeks.<br /><br />ASSUME ANY MONEY ADDED WILL BE LOST.</span
      >
      <Space size="md" />

      <div>
        <Container :size="440" class="maker">
          <div id="thebox">
            <div class="tabs">
              <button
                @click="toNavAct('cover')"
                :class="{ active: navAct === 'cover' }"
                v-tooltip="{
                  content: '<b>Buy Coverage</b>: Buy protection against a hack.',
                  delay: { show: 150, hide: 100 },
                }"
              >
                Coverage
              </button>
              <button
                @click="toNavAct('provide')"
                :class="{ active: navAct === 'provide' }"
                v-tooltip="{
                  content: '<b>Provide Coverage</b>: Deposit tokens that will be used as coverage.',
                  delay: { show: 150, hide: 100 },
                }"
              >
                Provide
              </button>
              <button
                @click="toNavAct('claim')"
                :class="{ active: navAct === 'claim' }"
                v-tooltip="{
                  content: '<b>Claim</b>: If a hack occured, claim payout here.',
                  delay: { show: 150, hide: 100 },
                }"
              >
                Claim
              </button>
              <button
                @click="toNavAct('withdraw')"
                :class="{ active: navAct === 'withdraw' }"
                v-tooltip="{
                  content: '<b>Withdraw</b>: Withdraw tokens from coverage providing.',
                  delay: { show: 150, hide: 100 },
                }"
              >
                Withdraw
              </button>
            </div>
            <div id="inputbox">
              <div>
                <div v-if="navAct === 'withdraw'" class="subtabs">
                  <button
                    @click="toWithdrawType('new')"
                    :class="{ active: withdrawType === 'new' }"
                    v-tooltip="{
                      content: '<b>Request Withdraw</b> Request to withdraw.',
                      delay: { show: 150, hide: 100 },
                    }"
                  >
                    Request New Withdraw
                  </button>
                  <button
                    @click="toWithdrawType('existing')"
                    :class="{ active: withdrawType === 'existing' }"
                    v-tooltip="{
                      content: '<b>Withdraw</b>: After a withdrawal request passes, you can withdraw collateral here.',
                      delay: { show: 150, hide: 100 },
                    }"
                  >
                    Withdraw
                  </button>
                </div>
                <div v-if="navAct == 'cover'" class="dropdown">
                  <vue-picker class="select" v-model="protocolSelected" @change="initAsset" placeholder="Select Protocol" autofocus>
                    <vue-picker-option value="">Select Protocol</vue-picker-option>
                    <vue-picker-option value="DYDX">dYdX</vue-picker-option>
                    <vue-picker-option value="COMPOUND">Compound</vue-picker-option>
                    <vue-picker-option value="AAVE">Aave</vue-picker-option>
                  </vue-picker>
                </div>
                <input
                  v-if="protocolSelected && navAct == 'cover'"
                  id=""
                  class="numeric setvalue"
                  type="number"
                  name=""
                  v-model="coverAmt"
                  v-on:keyup="tokenHandler"
                  :placeholder="'0.00 ' + 'DAI' + ' Payout'"
                  v-tooltip="{
                    content: '<b>Coverage Amount</b>: How much will be paid out if there is a hack/bug.',
                    delay: { show: 150, hide: 100 },
                    placement: 'left-center',
                  }"
                />
                <input
                  v-if="protocolSelected && navAct == 'cover'"
                  id=""
                  class="numeric setvalue"
                  type="number"
                  name=""
                  v-model="duration"
                  v-on:keyup="durationHandler"
                  placeholder="0 Days"
                  :disabled="navAct != 'cover'"
                  v-tooltip="{
                    content: '<b>Coverage Duration</b>: How long your coverage will last.',
                    delay: { show: 150, hide: 100 },
                    placement: 'left-center',
                  }"
                />
                <input
                  v-if="navAct == 'provide'"
                  id=""
                  class="numeric setvalue"
                  type="number"
                  name=""
                  v-model="coverAmt"
                  v-on:keyup="tokenHandler"
                  placeholder="0 DAI"
                  v-tooltip="{
                    content: '<b>Provide Amount</b>: How much to provide.',
                    delay: { show: 150, hide: 100 },
                    placement: 'left-center',
                  }"
                />
                <input
                  v-if="navAct == 'withdraw'"
                  id=""
                  class="numeric setvalue"
                  type="number"
                  name=""
                  v-model="coverAmt"
                  v-on:keyup="tokenHandler"
                  placeholder="0 DAI"
                  v-tooltip="{
                    content: '<b>Withdraw Amount</b>: How much to withdraw.',
                    delay: { show: 150, hide: 100 },
                    placement: 'left-center',
                  }"
                />
                <div class="price" v-if="price && navAct == 'cover'">Price: {{ price }} DAI</div>
                <div class="error" v-if="hasError && navAct !== 'lptrade'">
                  {{ currentError }}
                </div>
                <button :disabled="hasError == true" id="act" @click="act" v-bind:class="{ error: hasError }" v-if="navAct !== 'lptrade'">
                  {{
                    !isPending
                      ? protocolSelected || navAct != "cover"
                        ? approvals
                          ? approvals[approvalIdentifier()] === true || navAct == "claim" || navAct == "withdraw"
                            ? actName
                            : "Approve"
                          : "Select Token"
                        : "Select Token"
                      : ""
                  }}
                  <beat-loader v-if="isPending" color="#FF4A4A"></beat-loader>
                </button>
              </div>
            </div>
          </div>
        </Container>
      </div>
      <div class="info" v-if="info">
        <label
          v-tooltip="{
            content: 'Total reserves in the pool',
            delay: { show: 150, hide: 100 },
            placement: 'left-center',
          }"
          >Reserves: <b>{{ poolInfo.reserves ? poolInfo.reserves.div(ethDecs).toFixed(4) : "0" }}</b></label
        >
        <label
          v-tooltip="{
            content: 'Utilized reserves',
            delay: { show: 150, hide: 100 },
            placement: 'left-center',
          }"
          >Utilized: <b>{{ poolInfo.utilized ? poolInfo.utilized.div(ethDecs).toFixed(4) : "0" }}</b></label
        >
      </div>
    </Container>
  </div>
</template>
<script>
/* eslint-disable @typescript-eslint/camelcase */
import store from "@/store";
import { mapActions, mapGetters } from "vuex";
import BigNumber from "bignumber.js";

const ethDecs = new BigNumber(10).pow(new BigNumber(18));

export default {
  name: "Alpha",
  head: {
    title: "Alpha",
    meta: [{ name: "description", content: "Umbrella Alpha" }],
  },
  data() {
    return {
      navPage: "interact",
      actName: "Cover",
      withdrawType: "new",
      navAct: "cover",
      info: true,
      protocolSelected: null,
      coverAmt: null,
      duration: null,
      price: 0,
      hasError: false,
      currentError: null,
      balancePayToken: 0,
      displayBalancePayToken: 0,
      isPending: false,
      approvals: {},
      alphaContract: "0xc92ec84423db017ee76354b786ac9C60beA35379",
      payToken: "0x6b175474e89094c44da98b954eedeac495271d0f",
      accountProtections: {},
      poolInfo: {
        reserves: null,
        utilized: null,
      },
    };
  },
  async mounted() {
    await this.getPayTokenBalance();
    await this.updateApprovals();
    await this.initAsset();
    await this.getPool();
  },
  computed: {
    account() {
      return store.state.account;
    },
  },
  watch: {
    account(newAccount, oldAccount) {
      this.updateUserInfo();
    },
    protocolSelected: function(newVal, oldVal) {
      if (!this.protocolSelected) {
        return;
      }
      this.initAsset();
    },
  },
  components: {},
  methods: {
    ...mapActions([
      "getYamBalance",
      "getPositionData",
      "buyProtection",
      "provideCoverage",
      "requestWithdrawal",
      "withdrawRequestFinalize",
      "getUserPayTokenBalance",
      "getUserProtection",
      "getContractApproval",
      "fetchContractApproval",
      "checkContractApprovals",
      "getPrice",
      "getPoolInfo",
    ]),
    ...mapGetters(["empState"]),
    async availableCover() {
      if (this.poolInfo.utilized && this.poolInfo.reserves) {
        return this.poolInfo.reserves
          .sub(this.poolInfo.utilized)
          .div(ethDecs)
          .toFixed(4);
      } else {
        await this.getPool();
        return this.poolInfo.reserves
          .sub(this.poolInfo.utilized)
          .div(ethDecs)
          .toFixed(4);
      }
    },
    async getPool() {
      this.poolInfo = await this.getPoolInfo(this.metaAddr());
      console.log("poolinfo", this.poolInfo);
    },
    async initAsset() {
      this.fetchAllowance(this.approvalIdentifier(), this.alphaContract, this.payToken); // checks Approval
      this.updateApprovals();
    },
    async getPayTokenBalance() {
      this.balancePayToken = await this.getUserPayTokenBalance();
      this.displaybalancePayToken = new BigNumber(this.balanceWETH).div(ethDecs).toFixed(4);
    },
    async checkPrice() {
      this.price = new BigNumber(
        await this.getPrice({ metaPoolAddr: this.metaAddr(), coverage: new BigNumber(this.coverAmt).times(ethDecs), duration: this.duration * 86400 })
      )
        .div(ethDecs)
        .toFixed(4)
        .toString();
    },
    checkTime() {
      // checking if current time and 1day is greater than withdrawTime
      const current = this.moment();
      const withdrawTime = this.moment(1608332874734);
      const result = this.moment(current).isAfter(withdrawTime.add(1, "days")); // false
      // const result = this.moment(current.add(1, "days")).isAfter(withdrawTime); // true
      // console.log("result", result);
    },
    checkHasPending() {
      if (this.currPos) {
        if (Number(this.currPos.withdrawalRequestPassTimestamp) != 0) {
          return true;
        }
      }
      return false;
    },
    checkNewWithdraw() {
      if (this.currPos) {
        const tn = new Date().getTime() / 1000;
        if (this.checkHasPending()) {
          this.hasError = true;
          this.currentError = "Existing withdraw request active";
        } else if (Number(this.currPos.rawCollateral) == 0) {
          this.hasError = true;
          this.currentError = "No Collateral to withdraw from this position";
        } else if (tn + Number(this.currEMP.withdrawalLiveness) > Number(this.currEMP.expierationTimestamp)) {
          this.hasError = true;
          this.currentError = "Request expires post-expiry, wait for contract to expire";
        }
      }
    },
    checkWithdraw() {
      this.updateLiqPrice(false, true);
      if (this.currPos) {
        this.collatAmt = new BigNumber(this.currPos.withdrawalRequestAmount).div(ethDecs);
        const tn = new Date().getTime() / 1000;
        if (Number(this.currPos.withdrawalRequestPassTimestamp) == 0) {
          this.hasError = true;
          this.currentError = "Withdrawal must be requested and approved first";
        } else if (Number(this.currPos.rawCollateral) == 0) {
          this.hasError = true;
          this.currentError = "No Collateral to withdraw from this position";
        } else if (tn < Number(this.currPos.withdrawalRequestPassTimestamp)) {
          this.hasError = true;
          this.currentError = "Withdrawal still pending approval";
        }
      }
    },
    checkInstantWithdraw() {
      this.updateLiqPrice(false, true);
      if (this.currPos) {
        const tn = new Date().getTime() / 1000;
        if (this.checkHasPending()) {
          this.hasError = true;
          this.currentError = "Instant withdraw not allowed with active pending withdraw";
        } else if (Number(this.currPos.rawCollateral) == 0) {
          this.hasError = true;
          this.currentError = "No Collateral to withdraw from this position";
        } else if (
          (new BigNumber(this.currPos.rawCollateral) - new BigNumber(this.collatAmt).times(ethDecs)) /
            new BigNumber(this.currPos.tokensOutstanding) /
            this.price <
          this.gcr
        ) {
          const numerator = new BigNumber(this.currPos.rawCollateral) - new BigNumber(this.collatAmt).times(ethDecs);
          console.log("numerator", numerator);
          console.log("denom", this.currPos.tokensOutstanding);
          const newcr =
            (new BigNumber(this.currPos.rawCollateral) - new BigNumber(this.collatAmt).times(ethDecs)) /
            new BigNumber(this.currPos.tokensOutstanding);
          console.log(
            "HERE",
            newcr.toString(),
            new BigNumber(this.currPos.rawCollateral),
            new BigNumber(this.collatAmt).times(ethDecs),
            this.currPos.tokensOutstanding,
            this.gcr
          );
          this.hasError = true;
          this.currentError = "Withdrawal would put position below Global Collat Ratio";
        }
      }
    },
    runChecks() {
      this.hasError = false;
      this.currentError = "";
      if (this.navAct == "withdraw") {
        if (this.withdrawType == "existing") {
          this.checkWithdraw();
        } else if (this.withdrawType == "new") {
          this.checkNewWithdraw();
        }
      } else if (this.navAct == "cover") {
        this.coverAmt = 0;
        if (this.checkHasPending()) {
          this.hasError = true;
          this.currentError = "Cannot deposit with an active withdrawal request";
        } else if (this.currPos && this.currPos.rawCollateral == 0) {
          this.hasError = true;
          this.currentError = "No open position. Mint tokens first";
        } else if (Number(this.displayBalancePayToken) < Number(this.collatAmt)) {
          this.hasError = true;
          this.currentError = "Balance too low.";
        }
      } else if (this.navAct == "provide") {
        if (Number(this.displayBalancePayToken) < Number(this.collatAmt)) {
          this.hasError = true;
          this.currentError = "Balance too low.";
          return;
        }
      }
    },
    toWithdrawType(on) {
      this.withdrawType = on;
      if (on == "new") {
        this.actName = "Request Withdraw";
        this.hasError = false;
        this.currentError = "";
        this.checkNewWithdraw();
      } else if (on == "existing") {
        this.actName = "Withdraw";
        this.hasError = false;
        this.currentError = "";
        this.checkWithdraw();
      } else if (on == "instant") {
        this.actName = "Instant Withdraw";
        this.hasError = false;
        this.currentError = "";
        this.checkInstantWithdraw();
      }
    },
    metaAddr() {
      // switch (this.protocolSelected) {
      //   case "UGASJAN21":
      //     return [EMPJAN, UGASJAN21];
      //   case "UGASFEB21":
      //     return [EMPFEB, UGASFEB21];
      //   case "UGASMAR21":
      //     return [EMPMAR, UGASMAR21];
      //   default:
      //     return "";
      // }
      return this.alphaContract;
    },
    async getPosition() {
      // const pos = await this.getPositionData(this.metaAddr());
      // return pos;
    },
    conceptIndex() {
      console.log(this.protocolSelected);
      switch (this.protocolSelected) {
        case "DYDX":
          return 0;
        case "AAVE":
          return 1;
        case "COMPOUND":
          return 2;
        default:
          return -1;
      }
    },
    approvalIdentifier() {
      return this.payToken + "_" + this.metaAddr();
    },
    async act() {
      console.log(this.actName);
      if (!this.approvals[this.approvalIdentifier()]) {
        this.isPending = true;

        this.getApproval(this.approvalIdentifier(), this.metaAddr(), this.payToken)
          .then(async e => {
            console.log("approve", e[1]);
            this.isPending = false;
            if (e[1] && e[1] != "") {
              this.hasError = true;
              this.currentError = "Transaction would fail. Check balances & approvals";
            }
            this.updateUserInfo();
          })
          .catch(async e => {
            console.log("error", e[1]);
            this.isPending = false;
            if (e[1] && e[1] != "") {
              this.hasError = true;
              this.currentError = "Transaction would fail. Check balances & approvals";
            }
            this.updateUserInfo();
          });
      } else {
        switch (this.actName) {
          case "Cover":
            console.log("cover");
            this.isPending = true;
            this.buyProtection({
              metaPoolAddr: this.metaAddr(),
              conceptIndex: this.conceptIndex(),
              coverageAmount: new BigNumber(this.coverAmt).times(ethDecs),
              duration: this.duration * 86400,
              maxPay: new BigNumber(this.price).times(ethDecs) + ethDecs,
              deadline: Math.round(Date.now() / 1000 + 60 * 15),
            })
              .then(async e => {
                console.log("cover", e[1]);
                this.isPending = false;
                if (e[1] && e[1] != "") {
                  this.hasError = true;
                  this.currentError = "Transaction would fail. Check balances & approvals";
                }
                this.updateUserInfo();
              })
              .catch(async e => {
                console.log("error", e[1]);
                this.isPending = false;
                if (e[1] && e[1] != "") {
                  this.hasError = true;
                  this.currentError = "Transaction would fail. Check balances & approvals";
                }
                this.updateUserInfo();
              });
            break;
          case "Provide":
            console.log("provide");
            this.isPending = true;
            this.provideCoverage({ metaPoolAddr: this.metaAddr(), amount: new BigNumber(this.coverAmt).times(ethDecs).toString() })
              .then(async e => {
                this.isPending = false;
                if (e[1] && e[1] != "") {
                  this.hasError = true;
                  this.currentError = "Transaction would fail. Check balances & approvals";
                }
                this.updateUserInfo();
              })
              .catch(async e => {
                this.isPending = false;
                if (e[1] && e[1] != "") {
                  this.hasError = true;
                  this.currentError = "Transaction would fail. Check balances & approvals";
                }
                this.updateUserInfo();
              });
            break;
          case "Request Withdraw":
            console.log("req withdraw");
            this.isPending = true;
            this.requestWithdrawal({ contract: this.metaAddr()[0], collat: new BigNumber(this.collatAmt).times(ethDecs).toString() })
              .then(async e => {
                this.isPending = false;
                if (e[1] && e[1] != "") {
                  this.hasError = true;
                  this.currentError = "Transaction would fail. Check balances & approvals";
                }
                this.updateUserInfo();
              })
              .catch(async e => {
                this.isPending = false;
                if (e[1] && e[1] != "") {
                  this.hasError = true;
                  this.currentError = "Transaction would fail. Check balances & approvals";
                }
                this.updateUserInfo();
              });
            break;
          case "Withdraw":
            console.log("withdraw");
            this.isPending = true;
            this.withdrawRequestFinalize({ contract: this.metaAddr()[0] })
              .then(e => {
                this.isPending = false;
                if (e[1] && e[1] != "") {
                  this.hasError = true;
                  this.currentError = "Transaction would fail. Check balances & approvals";
                }
                this.updateUserInfo();
              })
              .catch(e => {
                this.isPending = false;
                if (e[1] && e[1] != "") {
                  this.hasError = true;
                  this.currentError = "Transaction would fail. Check balances & approvals";
                }
                this.updateUserInfo();
              });
            break;
          case "Instant Withdraw":
            console.log("instant withdraw");
            this.isPending = true;
            this.withdraw({ contract: this.metaAddr()[0], collat: new BigNumber(this.collatAmt).times(ethDecs).toString() })
              .then(e => {
                this.isPending = false;
                if (e[1] && e[1] != "") {
                  this.hasError = true;
                  this.currentError = "Transaction would fail. Check balances & approvals";
                }
                this.updateUserInfo();
              })
              .catch(e => {
                this.isPending = false;
                if (e[1] && e[1] != "") {
                  this.hasError = true;
                  this.currentError = "Transaction would fail. Check balances & approvals";
                }
                this.updateUserInfo();
              });
            break;
        }
      }
    },
    async updateUserInfo() {
      await Promise.all([this.getPayTokenBalance(), this.getPosition(), this.updateApprovals()]);
    },
    toNavPage(on) {
      this.navPage = on;
      console.log("toNavPage", on);
    },
    toNavAct(on) {
      this.hasError = false;
      this.currentError = "";
      this.navAct = on;
      this.actName = this.titleCase(on);
      if (on == "withdraw") {
        this.toWithdrawType("new");
      }
      this.runChecks();
      console.log("toNavAct", on);
    },
    tokenHandler() {
      this.posUpdateHandler();
    },
    durationHandler() {
      this.posUpdateHandler();
    },
    async posUpdateHandler() {
      // this.runChecks();
      this.checkPrice();
    },
    async getApproval(identifier, spenderAddress, tokenAddress) {
      if (spenderAddress) {
        await this.getContractApproval({ identifier: identifier, spenderAddress: spenderAddress, tokenAddress: tokenAddress });
      }
    },
    async fetchAllowance(identifier, spenderAddress, tokenAddress) {
      console.log("here");
      if (spenderAddress) {
        await this.fetchContractApproval({ identifier: identifier, spenderAddress: spenderAddress, tokenAddress: tokenAddress });
      }
    },
    async updateApprovals() {
      console.log("updating approvals");
      this.approvals = await this.checkContractApprovals();
      console.log("approvals", this.approvals);
    },
  },
};
</script>
<style lang="scss" scoped>
.maker {
  zoom: 1;
}
.hideDropdown {
  display: none;
}
.error {
  color: var(--primary);
  background: var(--back-act);
  text-align: center;
}
#inputbox {
}
.tabs {
  border-radius: 10px 10px 0px 0px;
  // border-radius: 10px;
  overflow: hidden;
  white-space: nowrap;
  button {
    cursor: pointer;
    width: calc(100% / 3.99);
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
}
.subtabs {
  overflow: hidden;
  white-space: nowrap;
  button {
    cursor: pointer;
    width: calc(100% / 1.9);
    border: none;
    height: 33px;
    font-size: 12px;
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
}
.info {
  font-size: 16px;
  margin: 0px 8px 0px 8px;
  padding: 8px 10px 8px 10px;
  color: #00000080;
  /* background: #ffe7e721; */
  border-radius: 0px 0px 10px 10px;
  label {
    display: block;
  }
}
.numeric {
  width: 100%;
  border: 0px;
  background: white;
  height: 50px;
  padding: 20px;
}
.setvalue {
  width: 100%;
  border: 0px;
  background: var(--back-act);
  color: var(--primary);
  // font-weight: 800;
  height: 50px;
  padding: 10px;
  font-size: 22px;
  // font-family: "Share Tech Mono", monospace;
  font-family: "Inconsolata", monospace;
  &::placeholder {
    color: rgba(255, 74, 74, 0.2);
    opacity: 1;
  }
  &:-ms-input-placeholder {
    color: rgba(255, 74, 74, 0.2);
  }
  &::-ms-input-placeholder {
    color: rgba(255, 74, 74, 0.2);
  }
}
.dropdown {
  border-radius: 0px 0px 10px 10px;

  .select {
    font-family: "Inconsolata", monospace;
    background: #ffeded;
  }
}
#thebox {
  box-shadow: 0px 1px 6px -2px #5a131669;
  border-radius: 10px;
}
#act {
  cursor: pointer;
  color: var(--primary);
  background: #ffe7e7;
  height: 50px;
  font-size: 20px;
  font-weight: 600;
  border: 0px;
  border-radius: 0px 0px 10px 10px;
  width: 100%;
  transition: background 0.1s ease-in-out;

  // &:hover {
  //   background: #ffe7e7;
  // }
  &:active {
    background: #ffe1e1;
  }
}
#act.error {
  cursor: not-allowed;
  color: #888888 !important;
}

.info-dropdown {
  cursor: pointer;
  color: var(--primary);
  background: var(--back-act);
  text-align: center;
}

.uniswap-info {
  background: #ffeded;
  border-radius: 0px 0px 10px 10px;
  padding: 2px 10px 5px 10px;
  min-height: 150px;
}

#chart {
  width: 200px;
  height: 200px;
}

.infoswitch {
  cursor: pointer;
  color: #fff;
  background: var(--primary);
  border: none;
  border-radius: 2px;
  padding: 0px 10px;
  font-size: 22px;
  font-weight: normal;
  height: 36px;
  margin: 6px 0px;
}

.echarts,
.chart-wrapper,
.chart-asset {
  width: 100%;
  height: 160px;
  margin-bottom: 15px;
}

.wrapETH {
  width: 100%;
  margin: 10px auto;
  .toggle {
    cursor: pointer;
    background: #e570671f;
    color: #e57067;
    border: none;
    border-radius: 8px;
    padding: 2px 20px;
    width: 100%;
    margin-bottom: 5px;
  }
  .wraprow {
    float: left;
    width: 100%;
    margin: 0px 0px 5px 0px;
    input {
      width: 65%;
      border: none;
      padding: 0px 10px;
      border-radius: 8px 0px 0px 8px;
      height: 30px;
      background: var(--back-act);
      color: var(--primary);
      float: left;
      font-size: 15px;
      &::placeholder {
        color: rgba(255, 74, 74, 0.2);
        opacity: 1;
      }
      &:-ms-input-placeholder {
        color: rgba(255, 74, 74, 0.2);
      }
      &::-ms-input-placeholder {
        color: rgba(255, 74, 74, 0.2);
      }
    }
    button {
      cursor: pointer;
      width: 35%;
      background: #e570671f;
      color: #e57067;
      border: none;
      border-radius: 0px 8px 8px 0px;
      height: 30px;
      text-align: center;
      float: right;
    }
  }
}
.warning {
  font-size: 20px;
  padding: 0px 30px;
  color: #ff3322;
}
</style>
