import numeral from "numeral";

export default {
  // data() { },
  // created: () => { },
  methods: {
    sendit: () => {
      console.log("sendit");
    },
    numeral: (format = "0.00a", ...texts) => {
      return numeral(...texts).format(format);
    },
  },
};
