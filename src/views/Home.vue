<template>
  <div class="home">
    <div class="home-content">
      <Container :size="800">
        <div class="umbrella">--</div>
        <div class="umbrella">Umbrella</div>
        <h2>Introduction</h2>
        <p>
          Throughout DeFi’s history, smart contract exploits have been a constant threat to the ecosystem, and it’s become clear that new risk
          management solutions must be created to supplement security audits. These solutions should be DeFi native, leveraging Ethereum’s unique
          capabilities, operating as open and permissionless, and balancing decentralized governance and immutability.
        </p>
        <br />
        <p>
          Yam's upcoming protection protocol is designed with these factors in mind, featuring perpetual ERC20 streaming coverage, immutable coverage
          pools, and a permissionless pool creation process that allows for customization and iteration over time.
        </p>
        <br />
      </Container>

      <Container :size="800">
        <b>Umbrella Protection Protocol</b>
        <b>Umbrella by Yam</b>
      </Container>
    </div>

    <div class="waves">
      <transition name="bounce"><div class="wave1" v-if="showWave1"></div></transition>
      <transition name="bounce"><div class="wave2" v-if="showWave2"></div></transition>
      <transition name="bounce"><div class="wave3" v-if="showWave3"></div></transition>
      <transition name="bounce"><div class="wave4" v-if="showWave4"></div></transition>
      <transition name="bounce"><div class="wave5" v-if="showWave5"></div></transition>
      <transition name="bounce"><div class="wave6" v-if="showWave6"></div></transition>
      <transition name="bounce"><div class="wave7" v-if="showWave7"></div></transition>
      <transition name="bounce"><div class="wave8" v-if="showWave8"></div></transition>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.bounce-enter-active {
  animation: bounce-in 0.5s;
}
.bounce-leave-active {
  animation: bounce-in 0.5s reverse;
}
@keyframes bounce-in {
  0% {
    opacity: 0;
    transform: scale(2);
  }
  // 80% {
  //   transform: scale(0.8);
  // }
  100% {
    opacity: 0.8;
    transform: scale(1);
  }
}

.home-content {
  z-index: 2;
  position: relative;
}
.umbrella {
  font-size: 94px;
  font-weight: 800;
}
.waves {
  display: none;
  overflow: hidden;
  background: var(--back-gradient);
  position: absolute;
  top: 0px;
  left: 0px;
  height: calc(100vh * 5);
  width: 100%;
  z-index: 0;
  opacity: 0.6;

  div {
    background-repeat: no-repeat;
    position: absolute;
    z-index: -10;
    &.wave1 {
      background: url("../assets/waves/1x/wave1.png");
      width: 697px;
      height: 864px;
      top: -40px;
      left: -80px;
    }
    &.wave2 {
      background: url("../assets/waves/1x/wave2.png");
      width: 592px;
      height: 619px;
      top: -40px;
      right: -60px;
    }
    &.wave3 {
      background: url("../assets/waves/1x/wave3.png");
      width: 326px;
      height: 1067px;
      top: 1320px;
      left: -20px;
    }
    &.wave4 {
      background: url("../assets/waves/1x/wave4.png");
      width: 358px;
      height: 1047px;
      top: 900px;
      right: -40px;
    }
    &.wave5 {
      background: url("../assets/waves/1x/wave5.png");
      width: 397px;
      height: 941px;
      top: 2600px;
      left: -60px;
    }
    &.wave6 {
      background: url("../assets/waves/1x/wave6.png");
      width: 461px;
      height: 1557px;
      top: 2100px;
      right: -60px;
    }
    &.wave7 {
      background: url("../assets/waves/1x/wave7.png");
      width: 353px;
      height: 878px;
      top: 3800px;
      left: -40px;
    }
    &.wave8 {
      background: url("../assets/waves/1x/wave8.png");
      width: 415px;
      height: 840px;
      top: 3900px;
      right: -40px;
    }
  }

  @media only screen and (min-width: 1400px) {
    display: block;
  }
}
</style>

<script>
export default {
  name: "Home",
  head: {},
  data() {
    return {
      delay: 200,
      scroller: 0,
      wavesActive: true,
      showWave1: false,
      showWave2: false,
      showWave3: false,
      showWave4: false,
      showWave5: false,
      showWave6: false,
      showWave7: false,
      showWave8: false,
    };
  },
  components: {},
  methods: {
    showWaves() {
      this.showWave1 = true;
      setTimeout(() => {
        this.showWave2 = true;
      }, this.delay);
    },
    handleScroll(event) {
      const scrollPos = window.scrollY;
      const winHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      this.scroller = (100 * scrollPos) / (docHeight - winHeight);
      if (this.scroller > 20) {
        setTimeout(() => {
          this.showWave3 = true;
        }, this.delay);
        this.showWave4 = true;
      }
      if (this.scroller > 60) {
        this.showWave5 = true;
        setTimeout(() => {
          this.showWave6 = true;
        }, this.delay);
      }
      if (this.scroller > 90) {
        setTimeout(() => {
          this.showWave7 = true;
        }, this.delay);
        this.showWave8 = true;
      }
    },
  },
  created() {
    if (this.wavesActive) {
      window.addEventListener("scroll", this.handleScroll);
    }
  },
  destroyed() {
    if (this.wavesActive) {
      window.removeEventListener("scroll", this.handleScroll);
    }
  },
  mounted() {
    if (this.wavesActive) {
      this.showWaves();
    }
  },
};
</script>
