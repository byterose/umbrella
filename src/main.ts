import Vue from "vue";
import VueMeta from "vue-meta";
import App from "@/App.vue";
import router from "@/router";
import store from "@/store";
import mixins from "@/mixins";
import "@/styles.scss";
import "@/filters";
import "animate.css";

Vue.config.productionTip = false;
Vue.use(VueMeta, { keyName: "head" });
Vue.mixin(mixins);

Vue.component("Header", () => import("@/components/Header.vue"));
Vue.component("Card", () => import("@/components/Card.vue"));
Vue.component("Button", () => import("@/components/Button.vue"));

// palette repo
Vue.component("Container", () => import("@/repo_palette/Container.vue"));
Vue.component("Space", () => import("@/repo_palette/Space.vue"));
Vue.component("Swipe", () => import("@/repo_palette/Swipe.vue"));

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount("#app");
