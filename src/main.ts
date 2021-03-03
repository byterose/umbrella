import Vue from "vue";
import VueMeta from "vue-meta";
import App from "@/App.vue";
import router from "@/router";
import store from "@/store";
import mixins from "@/mixins";
import { VuePicker, VuePickerOption } from "@invisiburu/vue-picker";
import VTooltip from "v-tooltip";
import BeatLoader from "vue-spinner/src/PulseLoader.vue";
import "@/plugins/tooltip/tooltip.scss";
import "@/store/auth";
import "@/filters";
import "@/styles.scss";
import "animate.css";
import "@invisiburu/vue-picker/dist/vue-picker.min.css";

Vue.config.productionTip = false;
Vue.mixin(mixins);
Vue.use(VueMeta, { keyName: "head" });
Vue.use(VTooltip);

Vue.component("Header", () => import("@/components/Header.vue"));
Vue.component("Card", () => import("@/components/Card.vue"));
Vue.component("Button", () => import("@/components/Button.vue"));
Vue.component("Modal", () => import("@/components/Modal.vue"));

// palette repo
Vue.component("Container", () => import("@/repo_palette/Container.vue"));
Vue.component("Space", () => import("@/repo_palette/Space.vue"));
Vue.component("Swipe", () => import("@/repo_palette/Swipe.vue"));

Vue.component("VuePicker", VuePicker);
Vue.component("VuePickerOption", VuePickerOption);
Vue.component("beat-loader", BeatLoader);

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount("#app");
