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
    };
  },
  head: {
    title: "Alpha",
  },
  components: {},
  methods: {
    ...mapActions(["disconnect", "reset", "getYamBalance"]),
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
  },
  mounted() {
    this.getConnector();
    this.getBalance();
  },
};
</script>
