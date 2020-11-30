<template>
  <header>
    <Container :size="1000">
      <div id="nav">
        <router-link to="/">
          <div class="umbrella-logo">
            <div class="picture"></div>
            <div class="label">Umbrella</div>
          </div>
        </router-link>
        <div class="router-links">
          <router-link to="/">Home</router-link>
          <router-link to="/coverage">Coverage</router-link>
          <router-link to="/claims">Claims</router-link>
          <!-- <router-link to="/account">Account</router-link> -->
          <!-- <router-link to="/about">About</router-link> -->
          <!-- <router-link to="/docs">Docs</router-link> -->
          <a href="https://yam.finance/" target="_blank">Yam.finance</a>
        </div>
        <div class="flex vert">
          <Swipe></Swipe>
          <Space />
          <button id="wallet" @click="connect">Connect Wallet</button>
        </div>
      </div>
    </Container>
  </header>
</template>

<style lang="scss" scoped>
header {
  display: flex;
  width: 100%;
  background: var(--back);
  box-shadow: 0px 0px 8px rgb(0 0 0 / 15%);
  height: 65px;
  margin-bottom: 24px;
  position: relative;
  z-index: 20;

  a {
    margin: 0px 10px;
    font-family: "Fira Sans", sans-serif;
    font-size: 14px;
    color: var(--text);

    &.router-link-exact-active {
      color: var(--primary);
    }
  }
}

#nav {
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin: 0 auto;
  padding: 15px 0px;
}

.umbrella-logo {
  display: flex;
  .picture {
    background: url("../assets/logo/32.png");
    background-size: 32px 32px;
    width: 32px;
    height: 32px;
  }
  .label {
    color: var(--text);
    font-weight: bold;
    font-size: 18px;
    margin-left: 12px;
    line-height: 1.8;
  }
}

.router-links {
  line-height: 2;
}

#wallet {
  cursor: pointer;
  background: var(--back-wallet);
  border-radius: 10px;
  border: none;
  width: 135px;
  height: 36px;
  color: var(--text-wallet);
  font-weight: 600;
  font-size: 14px;

  &:hover {
    box-shadow: 0px 2px 3px var(--back-wallet-hover);
  }
  &.connected {
  }
}
</style>

<script>
import { Umbrella } from "@/repo_umbrella_sdk";

export default {
  name: "Header",
  components: {},
  methods: {
    // fix
    send() {
      this.sendit("sendit");
    },
    connect() {
      console.log("connect");
      // store.dispatch("WalletLogin");
    },
  },
  mounted() {
    this.send();
  },
};
</script>
