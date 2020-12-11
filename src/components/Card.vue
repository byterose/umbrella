<template>
  <div class="card" :style="style">
    <slot></slot>
  </div>
</template>

<style lang="scss" scoped>
.card {
  background: #fff;
  width: 100%;
  box-shadow: 0px 4px 8px #3b2e4317;
  padding: 20px 20px;
  border-radius: 5px;
}

[data-theme="dark"] .card {
  background: #43314a;
  box-shadow: 0px 4px 6px #27162d2b inset;
}
</style>

<script>
export default {
  props: {
    size: Number,
  },
  computed: {
    style() {
      return null;
    },
  },
};
</script>
