import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";
import Home from "@/views/Home.vue";
import Coverage from "@/views/Coverage.vue";
import Claims from "@/views/Claims.vue";
import Account from "@/views/Account.vue";
import About from "@/views/About.vue";
import Alpha from "@/views/Alpha.vue";
import NotFound from "@/views/NotFound.vue";

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/coverage",
    name: "Coverage",
    component: Coverage,
  },
  {
    path: "/claims",
    name: "Claims",
    component: Claims,
  },
  {
    path: "/alpha",
    name: "Alpha",
    component: Alpha,
  },
  {
    path: "/account",
    name: "Account",
    component: Account,
  },
  {
    path: "/about",
    name: "About",
    component: About,
  },
  {
    path: "/404",
    name: "404",
    component: NotFound,
    props: true,
  },
  {
    path: "*",
    redirect: "404",
  },
];

const router = new VueRouter({
  mode: "history",
  routes,
  base: process.env.BASE_URL,
  scrollBehavior(to, from, saved) {
    if (saved) {
      return saved;
    } else {
      return { x: 0, y: 0 };
    }
  },
});

router.beforeEach((to, from, next) => {
  // console.log("load", to.name);
  // fix
  // progress.done();
  next();
});
router.afterEach((to, from) => {
  // console.log("load end", to.name);
  // fix
  // progress.done();
});

export default router;
