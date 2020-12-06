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
export default {
  name: "Coverage",
  head: {
    title: "Coverage",
    meta: [{ name: "description", content: "Get coverage, Provide coverage." }],
  },
  components: {},
  methods: {
    buyer() {
      console.log("buyer");
      return;
    },
    provider() {
      console.log("provider");
      return;
    },
  },
};
</script>
