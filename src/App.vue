<template>
  <div id="app">
    <Header />
    <router-view />
  </div>
</template>

<style lang="scss">
#app {
  // font-family: Helvetica, Arial, sans-serif;
  font-family: "Fira Sans", sans-serif;
}
</style>

<script>
export default {
  name: "App",
  head: {
    title: "Home",
    titleTemplate: "%s - Umbrella",
  },
  methods: {},
  mounted() {
    if (!navigator.cookieEnabled) {
      alert("Please enable cookies to fully enjoy this site!");
    }
  },
};
</script>
