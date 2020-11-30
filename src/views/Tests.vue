<template>
  <div class="tests">
    <Container :size="800">
      <!-- <p>Metamask: {{ web3.isInjected }}</p>
      <p>Network: {{ web3.networkId }}</p>
      <p>Account: {{ web3.coinbase }}</p>
      <p>Balance: {{ web3.balance }}</p> -->
    </Container>
  </div>
</template>

<style lang="scss" scoped></style>

<script>
export default {
  name: "Tests",
  head: {
    title: "Tests",
  },
  components: {},
};
</script>
