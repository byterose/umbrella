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
import { mapState } from "vuex";

export default {
  name: "App",
  head: {
    title: "Home",
    titleTemplate: "%s - Umbrella",
  },
  methods: {},
  // mounted() {},
  computed: mapState(["lang"]),
  watch: {
    lang() {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      // this.$router.replace({ params: { lang: this.lang } }).catch(() => {});
    },
  },
};
</script>
