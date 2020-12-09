<template>
  <div class="coverage">
    <!--
    <PageTitle></PageTitle>
    <Container :size="800">
      <b class="gray">Coverage</b>
    </Container>
    -->

    <Container :size="1000">
      <Card>
        <h1 class="accent">Umbrella Coverage</h1>
      </Card>

      <Space size="md" />

      <Button @click.native="buyer">Buy Coverage</Button>
      <br />
      <Button @click.native="provider">Provide Coverage</Button>
    </Container>
  </div>
</template>

<style lang="scss" scoped></style>

<script>
import store from "@/store";
import { mapActions } from "vuex";
export default {
  name: "Coverage",
  head: {
    title: "Coverage",
    meta: [{ name: "description", content: "Get coverage, Provide coverage." }],
  },
  data() {
    return {
      metapools: null,
    };
  },
  components: {},
  methods: {
    ...mapActions(["getMetaPool"]),
    buyer() {
      console.log("buyer");
      return;
    },
    provider() {
      console.log("provider");
      return;
    },
    async displayMetapools() {
      // initiate getting metapool to the store,
      // then getting the value from the store (and then we can get this value anywhere afterwards)
      await this.getMetaPool({ address: "0x9Ebc8AD4011C7f559743Eb25705CCF5A9B58D0bc" });
      this.metapools = store.state.currentMetapool;
      console.log("this.metapools", this.metapools);
    },
  },
  mounted() {
    this.displayMetapools();
  },
};
</script>
