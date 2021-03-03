<template>
  <div class="modal-container">
    <div class="modal">
      <div class="overlay-container" :class="showModal ? 'ease-in' : 'ease-out'" aria-hidden="true">
        <div class="overlay"></div>
      </div>

      <!-- Trick Browser to center the modal. -->
      <span class="center" aria-hidden="true">&#8203;</span>

      <div
        class="modal-panel"
        :class="showModal ? 'translate-y-4 ease-in' : 'translate-y-0 ease-out'"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-headline"
      >
        <div>
          <ul class="list">
            <li class="list-element" @click="auth('injected')">
              <div class="list-content">
                <img class="list-image" src="https://www.criptotendencias.com/wp-content/uploads/2019/02/metamask-logo.jpg" alt="" />
                <h3 class="list-title">Metamask</h3>
              </div>
            </li>
            <li class="list-element" @click="auth('walletconnect')">
              <div class="list-content">
                <img
                  class="list-image"
                  src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iMzAwcHgiIGhlaWdodD0iMTg1cHgiIHZpZXdCb3g9IjAgMCAzMDAgMTg1IiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPgogICAgPCEtLSBHZW5lcmF0b3I6IFNrZXRjaCA0OS4zICg1MTE2NykgLSBodHRwOi8vd3d3LmJvaGVtaWFuY29kaW5nLmNvbS9za2V0Y2ggLS0+CiAgICA8dGl0bGU+V2FsbGV0Q29ubmVjdDwvdGl0bGU+CiAgICA8ZGVzYz5DcmVhdGVkIHdpdGggU2tldGNoLjwvZGVzYz4KICAgIDxkZWZzPjwvZGVmcz4KICAgIDxnIGlkPSJQYWdlLTEiIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPgogICAgICAgIDxnIGlkPSJ3YWxsZXRjb25uZWN0LWxvZ28tYWx0IiBmaWxsPSIjM0I5OUZDIiBmaWxsLXJ1bGU9Im5vbnplcm8iPgogICAgICAgICAgICA8cGF0aCBkPSJNNjEuNDM4NTQyOSwzNi4yNTYyNjEyIEMxMTAuMzQ5NzY3LC0xMS42MzE5MDUxIDE4OS42NTA1MywtMTEuNjMxOTA1MSAyMzguNTYxNzUyLDM2LjI1NjI2MTIgTDI0NC40NDgyOTcsNDIuMDE5Njc4NiBDMjQ2Ljg5Mzg1OCw0NC40MTQwODY3IDI0Ni44OTM4NTgsNDguMjk2MTg5OCAyNDQuNDQ4Mjk3LDUwLjY5MDU5OSBMMjI0LjMxMTYwMiw3MC40MDYxMDIgQzIyMy4wODg4MjEsNzEuNjAzMzA3MSAyMjEuMTA2MzAyLDcxLjYwMzMwNzEgMjE5Ljg4MzUyMSw3MC40MDYxMDIgTDIxMS43ODI5MzcsNjIuNDc0OTU0MSBDMTc3LjY2MTI0NSwyOS4wNjY5NzI0IDEyMi4zMzkwNTEsMjkuMDY2OTcyNCA4OC4yMTczNTgyLDYyLjQ3NDk1NDEgTDc5LjU0MjMwMiw3MC45Njg1NTkyIEM3OC4zMTk1MjA0LDcyLjE2NTc2MzMgNzYuMzM3MDAxLDcyLjE2NTc2MzMgNzUuMTE0MjIxNCw3MC45Njg1NTkyIEw1NC45Nzc1MjY1LDUxLjI1MzA1NjEgQzUyLjUzMTk2NTMsNDguODU4NjQ2OSA1Mi41MzE5NjUzLDQ0Ljk3NjU0MzkgNTQuOTc3NTI2NSw0Mi41ODIxMzU3IEw2MS40Mzg1NDI5LDM2LjI1NjI2MTIgWiBNMjgwLjIwNjMzOSw3Ny4wMzAwMDYxIEwyOTguMTI4MDM2LDk0LjU3NjkwMzEgQzMwMC41NzM1ODUsOTYuOTcxMyAzMDAuNTczNTk5LDEwMC44NTMzOCAyOTguMTI4MDY3LDEwMy4yNDc3OTMgTDIxNy4zMTc4OTYsMTgyLjM2ODkyNyBDMjE0Ljg3MjM1MiwxODQuNzYzMzUzIDIxMC45MDczMTQsMTg0Ljc2MzM4IDIwOC40NjE3MzYsMTgyLjM2ODk4OSBDMjA4LjQ2MTcyNiwxODIuMzY4OTc5IDIwOC40NjE3MTQsMTgyLjM2ODk2NyAyMDguNDYxNzA0LDE4Mi4zNjg5NTcgTDE1MS4xMDc1NjEsMTI2LjIxNDM4NSBDMTUwLjQ5NjE3MSwxMjUuNjE1NzgzIDE0OS41MDQ5MTEsMTI1LjYxNTc4MyAxNDguODkzNTIxLDEyNi4yMTQzODUgQzE0OC44OTM1MTcsMTI2LjIxNDM4OSAxNDguODkzNTE0LDEyNi4yMTQzOTMgMTQ4Ljg5MzUxLDEyNi4yMTQzOTYgTDkxLjU0MDU4ODgsMTgyLjM2ODkyNyBDODkuMDk1MDUyLDE4NC43NjMzNTkgODUuMTMwMDEzMywxODQuNzYzMzk5IDgyLjY4NDQyNzYsMTgyLjM2OTAxNCBDODIuNjg0NDEzMywxODIuMzY5IDgyLjY4NDM5OCwxODIuMzY4OTg2IDgyLjY4NDM4MjcsMTgyLjM2ODk3IEwxLjg3MTk2MzI3LDEwMy4yNDY3ODUgQy0wLjU3MzU5NjkzOSwxMDAuODUyMzc3IC0wLjU3MzU5NjkzOSw5Ni45NzAyNzM1IDEuODcxOTYzMjcsOTQuNTc1ODY1MyBMMTkuNzkzNjkyOSw3Ny4wMjg5OTggQzIyLjIzOTI1MzEsNzQuNjM0NTg5OCAyNi4yMDQyOTE4LDc0LjYzNDU4OTggMjguNjQ5ODUzMSw3Ny4wMjg5OTggTDg2LjAwNDgzMDYsMTMzLjE4NDM1NSBDODYuNjE2MjIxNCwxMzMuNzgyOTU3IDg3LjYwNzQ3OTYsMTMzLjc4Mjk1NyA4OC4yMTg4NzA0LDEzMy4xODQzNTUgQzg4LjIxODg3OTYsMTMzLjE4NDM0NiA4OC4yMTg4ODc4LDEzMy4xODQzMzggODguMjE4ODk2OSwxMzMuMTg0MzMxIEwxNDUuNTcxLDc3LjAyODk5OCBDMTQ4LjAxNjUwNSw3NC42MzQ1MzQ3IDE1MS45ODE1NDQsNzQuNjM0NDQ0OSAxNTQuNDI3MTYxLDc3LjAyODc5OCBDMTU0LjQyNzE5NSw3Ny4wMjg4MzE2IDE1NC40MjcyMjksNzcuMDI4ODY1MyAxNTQuNDI3MjYyLDc3LjAyODg5OSBMMjExLjc4MjE2NCwxMzMuMTg0MzMxIEMyMTIuMzkzNTU0LDEzMy43ODI5MzIgMjEzLjM4NDgxNCwxMzMuNzgyOTMyIDIxMy45OTYyMDQsMTMzLjE4NDMzMSBMMjcxLjM1MDE3OSw3Ny4wMzAwMDYxIEMyNzMuNzk1NzQsNzQuNjM1NTk2OSAyNzcuNzYwNzc4LDc0LjYzNTU5NjkgMjgwLjIwNjMzOSw3Ny4wMzAwMDYxIFoiIGlkPSJXYWxsZXRDb25uZWN0Ij48L3BhdGg+CiAgICAgICAgPC9nPgogICAgPC9nPgo8L3N2Zz4="
                  alt=""
                />
                <h3 class="list-title">WalletConnect</h3>
              </div>
            </li>
          </ul>
        </div>
        <div class="button-container">
          <button type="button" @click="$emit('update:showModal', !showModal)" class="modal-button">Go back to dashboard</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.modal-container {
  overflow-y: auto;
  position: fixed;
  top: 0px;
  right: 0px;
  bottom: 0px;
  left: 0px;
  z-index: 10;
}

.modal {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  min-height: 100vh;
  padding-left: 1rem;
  padding-right: 1rem;
  padding-top: 1rem;
  padding-bottom: 5rem;
  text-align: center;

  @media (max-width: 800px) {
    display: block;
    padding: 0px;
  }
}

.overlay-container {
  position: fixed;
  top: 0px;
  right: 0px;
  bottom: 0px;
  left: 0px;
}

.overlay {
  background-color: rgba(107, 114, 128, 1);
  opacity: 0.75;
  position: absolute;
  top: 0px;
  right: 0px;
  bottom: 0px;
  left: 0px;
}

.center {
  display: none;

  @media (max-width: 800px) {
    display: inline-block;
    height: 100vh;
    vertical-align: middle;
  }
}

.modal-panel {
  background-color: var(--back);
  border-radius: 0.5rem;
  display: inline-block;
  overflow: hidden;
  padding-left: 1rem;
  padding-right: 1rem;
  padding-bottom: 1rem;
  padding-top: 1.25rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  text-align: left;
  vertical-align: bottom;

  @media (max-width: 800px) {
    margin-top: 2rem;
    margin-bottom: 2rem;
    max-width: 65ch;
    padding: 1.5rem;
    vertical-align: middle;
    width: 100%;
  }
}

.translate-y-4 {
  transform: translateX(0) translateY(1rem) rotate(0) skewX(0) skewY(0) scaleX(1) scaleY(1);

  @media (min-width: 800px) {
    transform: translateX(0) translateY(0) rotate(0) skewX(0) skewY(0) scaleX(0.95) scaleY(0.95);
  }
}

.translate-y-0 {
  transform: translateX(0) translateY(0) rotate(0) skewX(0) skewY(0) scaleX(1) scaleY(1);
}

.ease-in {
  opacity: 1;
  transition-timing-function: cubic-bezier(0.4, 0, 1, 1);
  transition-duration: 300ms;
}

.ease-out {
  opacity: 0;
  transition-timing-function: cubic-bezier(0, 0, 0.2, 1);
  transition-duration: 200ms;
}

.list {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(1, minmax(0, 1fr));

  @media (min-width: 800px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.list-element {
  cursor: pointer;
  background: #fff;
  box-shadow: 0px 4px 8px #3b2e4317;
  padding: 20px 20px;
  border-radius: 5px;
  text-align: center;
  display: flex;
  flex-direction: column;
  grid-column: span 1 / span 1;
}

[data-theme="dark"] .list-element {
  background: #43314a;
  box-shadow: 0px 4px 6px #27162d2b inset;
}

.list-content {
  display: flex;
  flex-direction: column;
  flex: 1 1 0%;
  padding: 2rem;
}

.list-image {
  background-color: rgba(0, 0, 0, 1);
  border-radius: 9999px;
  flex-shrink: 0;
  height: 8rem;
  margin-left: auto;
  margin-right: auto;
  width: 8rem;
}

.list-title {
  font-weight: 500;
  font-size: 0.875rem;
  line-height: 1.25rem;
  margin-top: 1.5rem;
  color: var(--text-wallet);
}

.button-container {
  margin-top: 1.25rem;

  @media (max-width: 800px) {
    margin-top: 1.5rem;
  }
}

.modal-button {
  cursor: pointer;
  background: var(--back-wallet);
  color: var(--text-wallet);
  border-color: transparent;
  border-radius: 10px;
  border: none;
  display: inline-flex;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  line-height: 1.5rem;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  padding-left: 1rem;
  padding-right: 1rem;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  width: 100%;

  @media (max-width: 800px) {
    font-size: 0.875rem;
    line-height: 1.25rem;
  }
}

.modal-button:hover {
  background-color: var(--back-wallet-hover);
}

.modal-button:focus {
  outline: 2px solid transparent;
  outline-offset: 2px;
  --ring-offset-shadow: 0 0 0 0 2px var(--tw-ring-offset-color);
  --ring-shadow: 0 0 0 0 4px rgba(59, 130, 246, 1);
  box-shadow: var(--ring-offset-shadow), var(--ring-shadow), var(0, 0 0 #0000);
}
</style>

<script>
import store from "@/store";
import { mapActions } from "vuex";

export default {
  name: "Modal",
  props: {
    showModal: Boolean,
  },
  computed: {
    style() {
      return null;
    },
  },
  data() {
    return {
      account: store.state.account,
    };
  },
  components: {},
  methods: {
    ...mapActions(["connect", "disconnect", "reset"]),
    async auth(connectorString) {
      const connected = await store.getters.connected;
      if (connected) {
        console.log("open user mini popup");
      } else {
        await this.connect({ connector: connectorString });
      }
    },
    async logout() {
      await this.disconnect();
      await this.reset();
    },
  },
};
</script>
