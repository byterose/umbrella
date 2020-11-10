<template>
  <div id="app">
    <div id="nav">
      <router-link to="/">YCP Home</router-link>
      <Space />
      <router-link to="/coverage">Coverage</router-link>
      <Space />
      <router-link to="/token">Token</router-link>
      <Space />
      <router-link to="/docs">Docs</router-link>
      <Space />
      <router-link to="/about">About</router-link>
      <Space />
    </div>
    <router-view />
  </div>
</template>

<style lang="scss">
#app {
  // font-family: Helvetica, Arial, sans-serif;
  font-family: "Fira Sans", sans-serif;
  text-align: center;
  color: #b92000;
}

#nav {
  padding: 30px;
  a {
    font-family: "Fira Sans", sans-serif;
    color: #2c3946;
    &.router-link-exact-active {
      color: var(--primary);
    }
  }
}
</style>

<script>
import Space from "@/components/Space.vue";
export default {
  components: {
    Space
  }
};
</script>
