<template>
  <div>
    <div class="locale-changer">
      <select v-model="lang">
        <option v-for="(lang, i) in langArray" :key="`lang${i}`" :value="lang">
          {{ lang }}
        </option>
      </select>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>

<script>
import store from "@/store";
import { languages } from "@/plugins/i18n";

export default {
  data() {
    return {
      langArray: languages,
    };
  },
  props: {
    size: Number,
  },
  computed: {
    style() {
      return null;
    },
    lang: {
      get: function() {
        return store.state.lang;
      },
      set: function(value) {
        store.dispatch("updateLang", { lang: value });
      },
    },
  },
};
</script>
